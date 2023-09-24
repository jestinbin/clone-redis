import { jest } from "@jest/globals";
import net from "net";
import { createServer } from "../../../server/index.js";

describe.skip("TCP Server e2e SIGINT tests", () => {
  let createStoreMock,
    createTCPServerMock,
    storeMock,
    storeCleanerMock,
    socketMock,
    exitSpy;

  beforeEach(() => {
    // Mock cleanup methods
    storeCleanerMock = {
      stopCleanup: jest.fn(),
    };
    socketMock = {
      close: jest.fn(),
    };

    exitSpy = jest.spyOn(process, "exit").mockImplementation(() => {});

    // Mock dependencies
    createStoreMock = jest.fn().mockReturnValue({
      store: storeMock,
      storeCleaner: storeCleanerMock,
    });
    createTCPServerMock = jest.fn().mockReturnValue(socketMock);

    // Clear any previously set listeners to SIGINT
    process.removeAllListeners("SIGINT");

    // jest.spyOn(console, "log").mockImplementation(() => {}); // to prevent console.log outputs in tests
  });

  it("should handle SIGINT", async () => {
    // Call your function
    const server = await createServer();

    // Send a SIGINT signal
    process.emit("SIGINT");

    // Check if cleanup methods were called
    expect(storeCleanerMock.stopCleanup).toHaveBeenCalled();
    expect(socketMock.close).toHaveBeenCalled();
  });
});
