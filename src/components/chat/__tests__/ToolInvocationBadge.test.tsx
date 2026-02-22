import { test, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { ToolInvocationBadge, getToolLabel } from "../ToolInvocationBadge";
import type { ToolInvocation } from "ai";

afterEach(() => {
  cleanup();
});

// ---------------------------------------------------------------------------
// getToolLabel — pure function tests
// ---------------------------------------------------------------------------

test("getToolLabel: str_replace_editor create", () => {
  expect(
    getToolLabel("str_replace_editor", {
      command: "create",
      path: "/src/components/Button.tsx",
    })
  ).toBe("Creating Button.tsx");
});

test("getToolLabel: str_replace_editor str_replace", () => {
  expect(
    getToolLabel("str_replace_editor", { command: "str_replace", path: "/App.jsx" })
  ).toBe("Editing App.jsx");
});

test("getToolLabel: str_replace_editor insert", () => {
  expect(
    getToolLabel("str_replace_editor", { command: "insert", path: "/App.jsx" })
  ).toBe("Editing App.jsx");
});

test("getToolLabel: str_replace_editor view", () => {
  expect(
    getToolLabel("str_replace_editor", { command: "view", path: "/App.jsx" })
  ).toBe("Viewing App.jsx");
});

test("getToolLabel: str_replace_editor undo_edit", () => {
  expect(
    getToolLabel("str_replace_editor", { command: "undo_edit", path: "/App.jsx" })
  ).toBe("Undoing edit to App.jsx");
});

test("getToolLabel: file_manager rename", () => {
  expect(
    getToolLabel("file_manager", {
      command: "rename",
      path: "/src/OldName.tsx",
      new_path: "/src/NewName.tsx",
    })
  ).toBe("Renaming OldName.tsx to NewName.tsx");
});

test("getToolLabel: file_manager delete", () => {
  expect(
    getToolLabel("file_manager", {
      command: "delete",
      path: "/src/OldComponent.tsx",
    })
  ).toBe("Deleting OldComponent.tsx");
});

test("getToolLabel: unknown tool falls back to tool name", () => {
  expect(getToolLabel("some_unknown_tool", {})).toBe("some_unknown_tool");
});

test("getToolLabel: extracts basename from nested path", () => {
  expect(
    getToolLabel("str_replace_editor", {
      command: "create",
      path: "/src/components/ui/Card.tsx",
    })
  ).toBe("Creating Card.tsx");
});

// ---------------------------------------------------------------------------
// ToolInvocationBadge — component tests
// ---------------------------------------------------------------------------

test("ToolInvocationBadge renders friendly label for create", () => {
  const toolInvocation: ToolInvocation = {
    toolCallId: "1",
    toolName: "str_replace_editor",
    args: { command: "create", path: "/Card.tsx" },
    state: "call",
  };
  render(<ToolInvocationBadge toolInvocation={toolInvocation} />);
  expect(screen.getByText("Creating Card.tsx")).toBeDefined();
});

test("ToolInvocationBadge renders friendly label for str_replace", () => {
  const toolInvocation: ToolInvocation = {
    toolCallId: "2",
    toolName: "str_replace_editor",
    args: { command: "str_replace", path: "/App.jsx" },
    state: "call",
  };
  render(<ToolInvocationBadge toolInvocation={toolInvocation} />);
  expect(screen.getByText("Editing App.jsx")).toBeDefined();
});

test("ToolInvocationBadge shows spinner while in-flight", () => {
  const toolInvocation: ToolInvocation = {
    toolCallId: "3",
    toolName: "str_replace_editor",
    args: { command: "create", path: "/Card.tsx" },
    state: "call",
  };
  const { container } = render(
    <ToolInvocationBadge toolInvocation={toolInvocation} />
  );
  expect(container.querySelector(".animate-spin")).toBeDefined();
  expect(container.querySelector(".bg-emerald-500")).toBeNull();
});

test("ToolInvocationBadge shows green dot when done", () => {
  const toolInvocation: ToolInvocation = {
    toolCallId: "4",
    toolName: "str_replace_editor",
    args: { command: "create", path: "/Card.tsx" },
    state: "result",
    result: "Success",
  };
  const { container } = render(
    <ToolInvocationBadge toolInvocation={toolInvocation} />
  );
  expect(container.querySelector(".bg-emerald-500")).toBeDefined();
  expect(container.querySelector(".animate-spin")).toBeNull();
});

test("ToolInvocationBadge shows spinner when result is falsy", () => {
  const toolInvocation: ToolInvocation = {
    toolCallId: "5",
    toolName: "str_replace_editor",
    args: { command: "create", path: "/Card.tsx" },
    state: "result",
    result: null,
  };
  const { container } = render(
    <ToolInvocationBadge toolInvocation={toolInvocation} />
  );
  expect(container.querySelector(".animate-spin")).toBeDefined();
});

test("ToolInvocationBadge renders label for file_manager rename", () => {
  const toolInvocation: ToolInvocation = {
    toolCallId: "6",
    toolName: "file_manager",
    args: { command: "rename", path: "/OldName.tsx", new_path: "/NewName.tsx" },
    state: "call",
  };
  render(<ToolInvocationBadge toolInvocation={toolInvocation} />);
  expect(screen.getByText("Renaming OldName.tsx to NewName.tsx")).toBeDefined();
});

test("ToolInvocationBadge renders label for file_manager delete", () => {
  const toolInvocation: ToolInvocation = {
    toolCallId: "7",
    toolName: "file_manager",
    args: { command: "delete", path: "/ToDelete.tsx" },
    state: "result",
    result: { success: true },
  };
  render(<ToolInvocationBadge toolInvocation={toolInvocation} />);
  expect(screen.getByText("Deleting ToDelete.tsx")).toBeDefined();
});
