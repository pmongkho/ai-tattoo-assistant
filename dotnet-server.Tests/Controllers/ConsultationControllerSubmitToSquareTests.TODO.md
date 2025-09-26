# ConsultationController.SubmitToSquare test checklist

## Pre-work
- [ ] Read the controller action to understand each response path (OK, BadRequest, NotFound, 500). Note how it pulls the user ID from the claims principal before delegating to the service.
- [ ] Skim the service method so you know which exceptions bubble up and what result object gets returned.

## Arrange guidance
- [ ] Decide on a helper for constructing the controller with a fake `ClaimsPrincipal`. Reuse it across scenarios so the Arrange section stays short.
- [ ] For success cases, configure the `IConsultationService` mock to return a `SquareSubmissionResult` instance. Reuse a single instance for assertion via `Assert.Same` so you can guarantee the controller does not copy the payload.
- [ ] For each error path, configure the mock to throw the exact exception type the controller handles (`ConsultationSubmissionException`, `KeyNotFoundException`, `InvalidOperationException`, generic `Exception`). Craft unique messages so it is obvious which branch executed.

## Act assertions
- [ ] Call `SubmitToSquare` with a deterministic `Guid` so your assertions do not rely on random values.
- [ ] Assert on the concrete `IActionResult` subtype (e.g., `OkObjectResult`, `BadRequestObjectResult`). Check both the HTTP status code and the shape of the returned payload.
- [ ] Verify the mock was invoked exactly once and with the expected `Guid` + user ID.
- [ ] Add negative verification (`VerifyNoOtherCalls`) so accidental interactions stand out.

## Extra scenarios to consider
- [ ] Missing user ID: simulate a controller with no `NameIdentifier` claim. Decide whether the action should short-circuit (e.g., `UnauthorizedResult`) or continue with `null` and assert the current behavior. Capture the discussion in comments if the behavior feels odd.
- [ ] Logging: if you want to assert logging on the 500 path, expose the logger mock and use `Verify` with `It.IsAny<Exception>()`. This is optional but provides extra confidence.

## Test execution strategy
- [ ] Prioritize the controller unit tests because they validate routing-level behavior. You can run them in isolation via `dotnet test dotnet-server.Tests --filter ConsultationControllerSubmitToSquare` once the .NET SDK is available.
- [ ] Service-level tests live in `dotnet-server.Tests/Services/ConsultationServiceSubmitToSquareTests.cs`. Tackle them separately when you want to cover persistence + Square integration logic. They complement (not replace) the controller tests.
