import { Octokit } from "@octokit/rest";
import { triggerWorkflow } from "./dynamicInputWorkflow.mjs";

// Mock the Octokit module
jest.mock("@octokit/rest", () => {
  return {
    Octokit: jest.fn(() => ({
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
    mockCreateWorkflowDispatch.mockResolvedValueOnce({ status: 204 });

    const request_id = "unique-request-id-123";
    await triggerWorkflow("some-client-id", request_id);

    expect(mockCreateWorkflowDispatch).toHaveBeenCalledWith({
      owner: "your-username",
      repo: "your-repo",
      workflow_id: "dynamic-input-workflow.yml",
      ref: "main",
      inputs: { request_id },
    });
  });
});

