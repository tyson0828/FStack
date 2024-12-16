const { Octokit } = require("@octokit/rest");
const { triggerWorkflow } = require("./dynamicInputWorkflow");

// Mock the Octokit class and its `actions.createWorkflowDispatch` method
jest.mock("@octokit/rest", () => {
  return {
    Octokit: jest.fn().mockImplementation(() => ({
      actions: {
        createWorkflowDispatch: jest.fn(),
      },
    })),
  };
});

describe("triggerWorkflow", () => {
  let octokitInstance;

  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();

    // Create an Octokit instance for the mocked implementation
    octokitInstance = new Octokit();
  });

  it("should trigger the workflow successfully", async () => {
    // Arrange
    const mockCreateWorkflowDispatch = octokitInstance.actions.createWorkflowDispatch;
    mockCreateWorkflowDispatch.mockResolvedValueOnce({ status: 204 });

    const request_id = "unique-request-id-123";

    // Act
    await triggerWorkflow("some-client-id", request_id);

    // Assert
    expect(mockCreateWorkflowDispatch).toHaveBeenCalledWith({
      owner: "your-username",
      repo: "your-repo",
      workflow_id: "dynamic-input-workflow.yml",
      ref: "main",
      inputs: {
        request_id: request_id,
      },
    });

    console.log = jest.fn(); // Mock console.log to check output
    expect(console.log).toHaveBeenCalledWith(
      `Workflow triggered for Request ID: ${request_id}`
    );
  });

  it("should handle errors and log an error message", async () => {
    // Arrange
    const mockCreateWorkflowDispatch = octokitInstance.actions.createWorkflowDispatch;
    mockCreateWorkflowDispatch.mockRejectedValueOnce(new Error("API error"));

    const request_id = "unique-request-id-123";

    // Mock console.error
    console.error = jest.fn();

    // Act
    await triggerWorkflow("some-client-id", request_id);

    // Assert
    expect(mockCreateWorkflowDispatch).toHaveBeenCalled();
    expect(console.error).toHaveBeenCalledWith("Error triggering workflow:", "API error");
  });
});

