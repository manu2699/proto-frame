# Feature spec: <name>
<!--
  THE SHARED CONTRACT. One file describes a feature; any skill can produce it and any skill can consume it. 
  Everything here is source of truth — whatever is filled in is taken as given, no matter who or what authored it.

  Authored by whoever's driving:
  - A PM / EM describing intent and persona by hand.
  - A developer who knows the screens and/or the API.
  - The `feature-spec` skill, which reads a repo (or pasted code) and fills the
    technical sections automatically, plus a first cut at intent/persona/screens.

  Every section is OPTIONAL. More filled in = sharper downstream output. The only
  things really worth having to start are Intent and Persona; screens and API can be
  proposed by a consumer (e.g. the wireframe skill proposes screens if that section is blank).

  Consumed by: the proto-frames skill, and intended to feed other skills (QA state-mapping, docs, frontend<->backend planning) over time.
-->

## Intent
<!-- One or two plain sentences: what does this feature let someone do? -->

## Persona
<!-- Who uses it. e.g. "a workspace admin", "a logged-in customer", "a warehouse picker" More than one is fine. -->

## Screens & states
<!-- The distinct screens/views, and which states each one has that matter.
     OPTIONAL — leave blank and a consumer (e.g. the wireframe skill) will PROPOSE a set
     you can prune. Don't invent screens just to fill this in.
     States worth noting per screen: default/filled, empty, loading, error, permission-denied.
     e.g.
     - Members page — list of teammates, Invite button, pending invites. States: default, empty
     - Invite modal — enter emails, send. States: default, error
     - Invitee accept screen — what the invited person lands on. States: pending, accepted, expired
-->

## API surface
<!-- OPTIONAL. The endpoints this feature involves, if known. Absorbs what used to live in
     a separate api.md. Empty is fine — if there's no backend yet, or the author doesn't
     know it, downstream skills describe intended behavior instead of real endpoints.
     May be a pasted OpenAPI/Swagger snippet. Per endpoint:
     - METHOD /path — purpose
       - Request: field (type, required/optional)
       - Response: field (type); status / error cases
       - Triggered from: <which screen/action>
     e.g.
     - POST /invites — send teammate invites
       - Request: emails (string[], required), role (enum, optional)
       - Response: invite_ids (string[]); 422 on invalid email
       - Triggered from: Invite modal, Send button
-->

## Auth / permissions
<!-- OPTIONAL. Who is allowed to do what — roles, scopes, ownership checks. Feeds permission-denied states in downstream UI.
     e.g.
     - POST /invites requires role: admin (403 otherwise)
     - Members page visible to any workspace member; Invite button admin-only
-->

## Field / data changes
<!-- OPTIONAL. New or changed fields, columns, enums, defaults. Mark new vs. modified.
     e.g.
     - invites.status — new enum: pending | accepted | expired
     - users.invited_by — new nullable FK
-->

## Events / side-effects
<!-- OPTIONAL. Things that happen as a result that the UI may need to reflect. e.g. "invitee receives an email", "members list shows a Pending badge". -->

## Frontend impact — the "so what"
<!-- OPTIONAL but high-value. In consumer terms, what does the front-end now need to build, change, or handle? This is the interpretation layer, not raw API docs.
     e.g. "Members page needs a pending-invites list and an Invite button; Invite modal needs inline validation for the 422 case." -->

## Assumptions / open questions
<!-- OPTIONAL. Anything the author (human or skill) inferred or couldn't determine. Surfaced honestly rather than guessed silently. -->