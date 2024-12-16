import { Octokit } from "@octokit/rest";
import { triggerWorkflow } from "./dynamicInputWorkflow.mjs";

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
  let mockCreateWorkflowDispatch;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.GITHUB_TOKEN = "fake-token";

    // Access the mocked function
    const octokitInstance = new Octokit();
    mockCreateWorkflowDispatch = octokitInstance.actions.createWorkflowDispatch;
  });

  it("should trigger the workflow successfully", async () => {
    // Arrange
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
        request_id,
      },
    });
  });

  it("should handle errors and log an error message", async () => {
    // Arrange
    mockCreateWorkflowDispatch.mockRejectedValueOnce(new Error("API error"));
    const request_id = "unique-request-id-123";

    // Mock console.error
    const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});

    // Act
    await triggerWorkflow("some-client-id", request_id);

    // Assert
    expect(mockCreateWorkflowDispatch).toHaveBeenCalled();
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "Error triggering workflow:",
      "API error"
    );

    // Cleanup
    consoleErrorSpy.mockRestore();
  });
});

