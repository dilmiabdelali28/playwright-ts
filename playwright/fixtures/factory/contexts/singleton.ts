let fixtureContext: Record<string, unknown> = {};

export const addToFixtureContext = (context: Record<string, unknown>) => {
  fixtureContext = { ...fixtureContext, ...context };

  return fixtureContext;
};
