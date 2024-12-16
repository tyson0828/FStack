const { Octokit } = require("@octokit/rest");
const { triggerWorkflow } = require("./dynamicInputWorkflow");

// Mock Octokit
jest.mock("@octokit/rest", () => {
  const mockCreateWorkflowDispatch = jest.fn();
  return {
    Octokit: jest.fn(() => ({
      actions: {
        createWorkflowDispatch: mockCreateWorkflowDispatch,
      },
    })),
    __mocks__: {
      createWorkflowDispatch: mockCreateWorkflowDispatch,
    },
  };
});

describe("triggerWorkflow", () => {
  const mockCreateWorkflowDispatch = Octokit.__mocks__.createWorkflowDispatch;
  const owner = "your-username";
  const repo = "your-repo";
  const workflow_id = "dynamic-input-workflow.yml";
  const ref = "main";

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.GITHUB_TOKEN = "fake-token"; // Set a fake token for tests
  });

  it("should trigger the workflow successfully", async () => {
    // Arrange
    mockCreateWorkflowDispatch.mockResolvedValueOnce({ status: 204 }); // Simulate a successful API response
    const request_id = "unique-request-id-123";

    // Act
    await triggerWorkflow(request_id);

    // Assert
    expect(mockCreateWorkflowDispatch).toHaveBeenCalledWith({
      owner,
      repo,
      workflow_id,
      ref,
      inputs: { request_id },
    });
    console.log = jest.fn(); // Ensure logging was called
    expect(console.log).toHaveBeenCalledWith(
      `Workflow triggered for Request ID: ${request_id}`
    );
  });

  it("should log an error if workflow dispatch fails", async () => {
    // Arrange
    const request_id = "unique-request-id-123";
    const errorMessage = "Request failed with status code 500";
    mockCreateWorkflowDispatch.mockRejectedValueOnce(new Error(errorMessage));

    // Act
    await triggerWorkflow(request_id);

    // Assert
    expect(mockCreateWorkflowDispatch).toHaveBeenCalledWith({
      owner,
      repo,
      workflow_id,
      ref,
      inputs: { request_id },
    });
    console.error = jest.fn(); // Mock console.error
    expect(console.error).toHaveBeenCalledWith("Error triggering workflow:", errorMessage);
  });

  it("should throw an error if no GITHUB_TOKEN is provided", async () => {
    // Arrange
    delete process.env.GITHUB_TOKEN; // Remove token

    // Act & Assert
    await expect(triggerWorkflow("unique-request-id-123")).rejects.toThrow(
      "Octokit authentication token is missing"
    );
  });
});
