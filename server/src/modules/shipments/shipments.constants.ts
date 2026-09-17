export const ALLOWED_TRANSITIONS: Record<string, string[]> = {
  CREATED: ["IN_TRANSIT", "CANCELLED"],
  IN_TRANSIT: ["OUT_FOR_DELIVERY", "CANCELLED"],
  OUT_FOR_DELIVERY: ["DELIVERED", "CANCELLED"],
  DELIVERED: [],
  CANCELLED: [],
};

export const isValidTransition = (
  currentState: string,
  newState: string,
): boolean => {
  const allowed = ALLOWED_TRANSITIONS[currentState];
  return allowed ? allowed.includes(newState) : false;
};
