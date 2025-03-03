export function request(ctx) {
  return {
    operation: "Invoke",
    invocationType: "Event", 
    payload: ctx.stash.chats
  }
}

export function response(ctx) {
  return ctx.result
}