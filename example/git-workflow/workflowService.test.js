const { triggerWorkflow } = require("./workflowService");
const { Octokit } = require("@octokit/rest");

jest.mock("@octokit/rest");

describe("triggerWorkflow", () => {
  let mockCreateWorkflowDispatch;

  beforeEach(() => {
    // Mock Octokit methods
    mockCreateWorkflowDispatch = jest.fn();

    Octokit.mockImplementation(() => ({
      actions: {
        createWorkflowDispatch: mockCreateWorkflowDispatch,
      },
    }));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should trigger the workflow successfully", async () => {
    // Arrange: Mock successful API response
    mockCreateWorkflowDispatch.mockResolvedValueOnce({ status: 204 });

    // Act
    const result = await triggerWorkflow("client-123", "request-456");

    // Assert
    expect(result).toEqual({
      success: true,
      client_id: "client-123",
      request_id: "request-456",
    });

    expect(mockCreateWorkflowDispatch).toHaveBeenCalledWith({
      owner: "your-username",
      repo: "your-repo",
      workflow_id: "dynamic-input-workflow.yml",
      ref: "main",
      inputs: {
        client_id: "client-123",
        request_id: "request-456",
      },
    });
  });

  it("should throw an error if the API call fails", async () => {
    // Arrange: Mock API failure
    mockCreateWorkflowDispatch.mockRejectedValueOnce(new Error("API Error"));

    // Act & Assert
    await expect(triggerWorkflow("client-123", "request-456")).rejects.toThrow("Failed to trigger workflow");

    expect(mockCreateWorkflowDispatch).toHaveBeenCalledWith({
      owner: "your-username",
      repo: "your-repo",
      workflow_id: "dynamic-input-workflow.yml",
      ref: "main",
      inputs: {
        client_id: "client-123",
        request_id: "request-456",
      },
    });
  });
});

