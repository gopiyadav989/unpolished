import { useState } from "react";
import { BlockNoteEditor, PartialBlock } from "@blocknote/core";
import { useCreateBlockNote } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/mantine";
import { codeBlock } from "@blocknote/code-block";
import "@blocknote/mantine/style.css";
import "@blocknote/core/fonts/inter.css";

// Centralized styling
const baseStyles = {
  "--block-note-spacing-sm": "0.5rem",
  "--block-note-spacing-md": "0.75rem",
  "--block-note-spacing-lg": "1.5rem",
  "--block-note-text-base-size": "18px",
  "--block-note-font-family":
    "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif",
  "--block-note-border-radius": "4px",
  border: "none",
  boxShadow: "none",
  padding: "0"
};

const editableStyle = {
  minHeight: "calc(100vh - 250px)"
};

const readonlyStyle = {
  minHeight: "auto",
  fontFamily: "var(--block-note-font-family)"
};

interface EditorProps {
  onChange: (value: string) => void;
  initialContent: string;
  editable?: boolean;
}

export function Editor({ onChange, initialContent, editable = true }: EditorProps) {
  const initialBlocks = initialContent
    ? (JSON.parse(initialContent) as PartialBlock[])
    : undefined;

  const [blocks, setBlocks] = useState<PartialBlock[]>(initialBlocks || []);

  const editor: BlockNoteEditor = useCreateBlockNote({
    initialContent: blocks,
    domAttributes: {
      editor: {
        class: "prose prose-lg max-w-none"
      }
    },
    codeBlock
  });

  const combinedStyle = {
    ...baseStyles,
    ...(editable ? editableStyle : readonlyStyle)
  };

  return (
    <BlockNoteView
      editor={editor}
      editable={editable}
      theme="light"
      style={combinedStyle}
      onChange={() => {
        const updated = editor.document;
        setBlocks(updated);
        onChange(JSON.stringify(updated));
      }}
    />
  );
}
