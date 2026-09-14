---
title: "Keeping Privacy Centered"
description: "Privacy in a multi-agent AI platform described as a series of design tenets"
pubDate: 2026-09-02
draft: false
---

## Privacy as layers, not a single control

I broadly want to discuss using a combination of network controls and identity to control user and agent behavior.

## The shared infrastructure

The pieces involved:

- **Container Apps** hosting the agent code itself
- An **observability tool**, reachable only from within the VNet
- A **managed database service** handling vector search and chat history
- An **in-memory data layer** used for chat session state, caching, and lightweight queuing
- An **MCP server** brokering tool calls made by agents
- A **collaboration platform** that's the entry point users actually interact with

## Tenet 1: network isolation as the starting point

Network controls allow us to do a first layer of security from the perspective of answering the question "Who can actually reach this service?". Some agents are confined to subnets on the internal VNet, and the observability tooling is only reachable from inside that VNet. Nothing outside that boundary can even attempt to reach it.

This is deliberately the cheapest, coarsest layer. It doesn't know or care who's calling.

## Tenet 2: every agent gets its own identity

On top of network placement, every agent has its own managed identity as opposed to a shared service principal that all agents authenticate as. This means shared resources (the database, the cache, the observability tool, MCP tool access) can scope access per agent: which agent can call which tool, read which data, write to which store. It also means every action against those resources is attributable to a specific agent, which matters as much for auditing as it does for access control.

## Tenet 3: user identity travels with every request

So the model extends: whenever an agent acts on a user's behalf, that user's identity travels with the request through the whole chain. We won't drop identity at boundaries. However, we also don't want to blindly pass in user tokens through the MCP server. [See here for the Anthropic MCP spec](https://modelcontextprotocol.io/specification/2026-07-28/basic/authorization) I've been thinking alot about. I'll talk more about that in Tenet 5.

## Tenet 4: one source of truth for identity

The above only works if identity is trustworthy end-to-end, which means no agent or data service gets to keep its own separate list of users. A central identity provider is the single source of truth for every identity in the system and each system in the architecture can use that single provider to authenticate and decide if the identity is authorized to perform an action.

## Tenet 5: on-behalf-of token exchange through MCP

MCP tool calls following [best practice](https://modelcontextprotocol.io/specification/2026-07-28/basic/authorization) forward identity using on-behalf-of token exchange. When an agent calls a tool that reaches, our cloud data warehouse, that call carries the identity of the agent making the call and the identity of the user the agent is acting for. Rather than passing a single token through every hop, each delegated call exchanges for a new, properly-audienced token. A service only ever sees a token that was actually meant for it, scoped to what that call needs.

The warehouse can then trim what it returns based on the combination of the two: what this agent is allowed to access, intersected with what this user is allowed to access. The agent identity or the user identity on their own are not enough to make that call. 

## What the above tenets get us

Each layer here covers a failure mode the others don't:

- **Network isolation** limits exposure even if there's a bug in an identity check — some things simply aren't reachable from outside the VNet, full stop.
- **Per-agent identity** gives per-agent auditability and scoping regardless of network position — useful even for agents that do need broader reachability.
- **User identity propagation** is what makes access decisions *correct* once a single agent is serving many different people.

None of these substitute for each other. They're defense in depth, and each one narrows the set of things that can go wrong.

If I had to compress this into a short list for someone building a similar platform:

1. Start with network isolation and per-agent identity — cheap, coarse, and they catch a lot on their own.
2. Layer in user identity propagation as soon as agents start acting on behalf of people, not just on behalf of themselves.
3. Keep a single source of truth for identity — no shadow user lists anywhere in the system.
4. Propagate both the agent's and the user's identity through delegated calls (on-behalf-of), so backend systems can enforce on the combination.
5. Treat all of the above as layers, not alternatives.

As agents get more autonomous and start chaining more tool calls together, this is the part that scales: network isolation and agent identity keep bounding how much damage any one thing can do, while user-identity propagation keeps every individual decision correct at the level of the actual person it's about.

AI Disclaimer: I used Claude to help with the structure and the final summary. The practices described are things I built.