# Xu Bing: Epistemic Gallery — Design Case Study

## One-Line Thesis

This is not a website about Xu Bing. It is an interface that borrows Xu Bing's central problem: the visitor recognizes a sign, reaches for meaning, and discovers that recognition is not the same as reading.

## The Professional Reframe

The public frame is stronger than the production history:

> How should a digital exhibition behave when the artwork is not just visual content, but a theory of misreading?

Most museum and archive interfaces are built around retrieval: find the artist, open the record, inspect metadata, read the caption. That pattern is useful, but it turns conceptually unstable work into stable information.

For Xu Bing, that is a serious translation loss. His work often sits in the gap between visual fluency and semantic failure. The digital interface should not erase that gap by explaining it too early.

## Design Philosophy

### 1. The Interface Is Part Of The Argument

The gallery does not treat interaction as a wrapper around content. Interaction is the medium through which the argument is delivered.

If visitors only read that Xu Bing produces unreadability, they understand the claim from a distance. If they click, hesitate, classify, fail, recover, and then receive explanation, they encounter the claim as an event.

### 2. Difficulty Is Not The Enemy

The project rejects the default assumption that all friction is bad. Some friction is noise. Some friction is meaning.

The central design task is classification:

- Remove friction that prevents access.
- Preserve friction that produces interpretation.

That distinction is the project.

### 3. Orientation Must Be Humane

The visitor should never have to fight the interface to know where they are. Navigation, section identity, and recovery paths should be legible.

The content can remain difficult. The container should not.

### 4. Trust Has To Be Designed

Dense theory without source clarity becomes suspicious. In this project, interpretive writing is supported by authorship tags, artwork provenance, timeline context, and explicit conceptual links.

The issue is not whether visitors can understand difficult text. The issue is whether the interface gives them enough trust architecture to decide how to read it.

## Product Decisions

### Decision 1 — Preserve The Delayed Entry

The entry mark is intentionally ambiguous. It points toward entering, but withholds immediate clarity long enough for the visitor to feel suspended.

Why preserve it:

- It turns "reading failure" into the first interaction.
- It prevents the thesis from becoming only explanatory copy.
- It sets the terms of the gallery before the visitor reaches the rooms.

Failure mode:

- If the delay feels like a broken button, the interaction fails as design.

Mitigation:

- Keep the delay short.
- Provide a tooltip after the pause.
- Make the rest of the navigation system more stable so the ambiguity does not contaminate the whole interface.

### Decision 2 — Make The Glyph Engine Unlabeled First

The Glyph Engine asks visitors to classify a character before category labels are revealed.

Why preserve it:

- Labeled choices would turn the interaction into recognition.
- Unlabeled choices turn it into an encounter with uncertainty.
- The reveal after the guess makes the system's logic visible.

Failure mode:

- Visitors may read the hidden labels as arbitrary obstruction.

Mitigation:

- Reveal all labels immediately after commitment.
- Explain the category after the attempt.
- Track attempts visibly so the interaction reads as a designed instrument, not a prank.

### Decision 3 — Repair Navigation Without Flattening Meaning

The research showed that visitors could tolerate conceptual ambiguity, but not broken orientation.

Changes made:

- Persistent navigation
- Minimap
- Section tracking
- Breadcrumbs
- Browser back-navigation guard
- More explicit links between artwork, timeline, and theory

Why this matters:

The project only works if the visitor can tell the difference between "I am lost because the artwork is difficult" and "I am lost because the website is badly structured."

### Decision 4 — Treat AR As A Spatial Argument, Not A Feature Checklist

The AR section is not presented as a finished hardware product. It is a concept extension: what would happen if the reading failure moved from screen space into architectural space?

Professional boundary:

- The current browser build implements the core interaction system.
- Spatial AR, gaze-responsive audio, and deep-zoom character inspection remain concept directions.

That boundary should stay visible, but not apologetic.

## Evidence

Evidence available:

- A working browser prototype.
- Three moderated think-aloud sessions.
- Observation notes grouped into entry logic, affordance, orientation, and interpretive depth.
- A documented redesign from navigation failure toward orientation support.
- A functioning deployment pipeline through GitHub Pages.

Evidence not available:

- No broad museum-audience validation.
- No completed post-revision audience study.
- No implemented hardware AR layer.
- No analytics showing live visitor behavior.

Professional interpretation:

This is a strong design case study and interaction prototype. It should not be described as a validated museum product.

## What Makes This Valuable

The value is not "I made a gallery website."

The value is the design judgment:

- Knowing when clarity helps and when it destroys the experience.
- Separating usability repair from conceptual flattening.
- Turning philosophical content into interaction behavior.
- Designing trust architecture for difficult interpretation.
- Building a real prototype instead of leaving the idea at the level of slides.

This is the part worth carrying into a portfolio, interview, or graduate/professional application.

## How To Present It

Use this hierarchy:

1. Thesis: The interface makes reading fail.
2. Problem: Archive logic cannot fully carry work about unreadability.
3. Principle: Remove parasitic friction; preserve load-bearing friction.
4. Artifact: Show the entry, rooms, Glyph Engine, theory layer, and navigation system.
5. Evidence: Explain what user observation changed.
6. Boundary: State what is implemented and what remains concept-level.

Do not lead with:

- Process labels
- Internal production sequence
- Tool disclosure
- Every research artifact
- Defensive explanations of missing validation

Those can exist in private process documentation. They are not the public face.

## Failure Modes To Avoid

### Overclaiming

Do not say the final design has been validated by a completed post-revision audience study. It has not.

### Over-academizing

Do not make the public reader walk through internal production structure. The public reader needs thesis, decisions, artifact, and evidence.

### Over-aestheticizing

Do not let the screenshots become the whole story. The visuals are strong, but the value is the design logic behind them.

### Over-hiding

Do not pretend the project is a fully launched museum product. It is more credible as a high-fidelity interpretive prototype with a sharp conceptual frame.

### Over-explaining

Do not explain the whole theory before showing the interaction. The case study should preserve the same discipline as the product: let the visitor encounter the idea before receiving the full interpretation.

## External References Checked

- Xu Bing Studio, [artwork index and artist materials](https://www.xubing.com/en/work), checked July 23, 2026.
- The Metropolitan Museum of Art, [*An Introduction to Square Word Calligraphy*](https://www.metmuseum.org/exhibitions/view?exhibitionId=%7B2cca0d85-6307-4ac7-9674-c4e4f675c08e%7D&fe=1&oid=73325), checked July 23, 2026.
- GitHub Docs, [custom GitHub Pages workflows](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages), checked July 23, 2026.
- Interaction Design Foundation, [UX case study guidance](https://www.interaction-design.org/literature/topics/ux-case-studies), checked July 23, 2026.
- IDEO.org, [design services and impact framing](https://www.ideo.org/services), checked July 23, 2026.
