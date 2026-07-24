// Flow affordance: a small marker showing an element navigates (→), opens a
// modal (⊕), or performs an action (↵).

export function FlowTag(props: { goto?: string; opens?: string; action?: string }) {
  if (!props.goto && !props.opens && !props.action) return null;
  return (
    <div className="wf-flow absolute inset-0 z-10 cursor-pointer" />
  );
}
