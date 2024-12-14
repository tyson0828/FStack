const { createWorkflowDispatch, getWorkflowStatus } = require("./githubActions");
const { Octokit } = require("@octokit/rest");

// Mock @octokit/rest
jest.mock("@octokit/rest");

describe("GitHub Actions API", () => {
  let mockCreateWorkflowDispatch;
  let mockGetWorkflowRun;

  beforeEach(() => {
    // Mock Octokit methods
    mockCreateWorkflowDispatch = jest.fn();
    mockGetWorkflowRun = jest.fn();

    Octokit.mockImplementation(() => ({
      actions: {
        createWorkflowDispatch: mockCreateWorkflowDispatch,
        getWorkflowRun: mockGetWorkflowRun,
      },
    }));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("createWorkflowDispatch", () => {
    it("should trigger the workflow successfully", async () => {
      // Arrange: Mock API response
      mockCreateWorkflowDispatch.mockResolvedValueOnce({ status: 204 });

      // Act
      const result = await createWorkflowDispatch({
        token: "mock-token",
        owner: "mock-owner",
        repo: "mock-repo",
        workflow_id: "test-workflow.yml",
        ref: "main",
        inputs: { key: "value" },
      });

      // Assert
      expect(result).toBe("Workflow test-workflow.yml triggered successfully on branch main");
      expect(mockCreateWorkflowDispatch).toHaveBeenCalledWith({
        owner: "mock-owner",
        repo: "mock-repo",
        workflow_id: "test-workflow.yml",
        ref: "main",
        inputs: { key: "value" },
      });
    });

    it("should throw an error if the API call fails", async () => {
      // Arrange: Mock API error
      mockCreateWorkflowDispatch.mockRejectedValueOnce(new Error("API Error"));

      // Act & Assert
      await expect(
        createWorkflowDispatch({
          token: "mock-token",
          owner: "mock-owner",
          repo: "mock-repo",
          workflow_id: "test-workflow.yml",
          ref: "main",
          inputs: { key: "value" },
        })
      ).rejects.toThrow("API Error");
    });
  });

  describe("getWorkflowStatus", () => {
    it("should return the status and conclusion of the workflow", async () => {
      // Arrange: Mock API response
      mockGetWorkflowRun.mockResolvedValueOnce({
        data: {
          status: "completed",
          conclusion: "success",
        },
      });

      // Act
      const result = await getWorkflowStatus({
        token: "mock-token",
        owner: "mock-owner",
        repo: "mock-repo",
        run_id: 12345,
      });

      // Assert
      expect(result).toEqual({
        status: "completed",
        conclusion: "success",
      });
      expect(mockGetWorkflowRun).toHaveBeenCalledWith({
        owner: "mock-owner",
        repo: "mock-repo",
        run_id: 12345,
      });
    });

    it("should throw an error if the API call fails", async () => {
      // Arrange: Mock API error
      mockGetWorkflowRun.mockRejectedValueOnce(new Error("API Error"));

      // Act & Assert
      await expect(
        getWorkflowStatus({
          token: "mock-token",
          owner: "mock-owner",
          repo: "mock-repo",
          run_id: 12345,
        })
      ).rejects.toThrow("API Error");
    });
  });
});

