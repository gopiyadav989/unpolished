import { useState } from "react";
import { BlockNoteEditor, PartialBlock } from "@blocknote/core";
import { useCreateBlockNote } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/mantine";
import { codeBlock } from "@blocknote/code-block";
import "@blocknote/mantine/style.css";
import "@blocknote/core/fonts/inter.css";

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


  return (
    <BlockNoteView
      editor={editor}
      editable={editable}
      theme={"light"}
      onChange={() => {
        const updated = editor.document;
        setBlocks(updated);
        onChange(JSON.stringify(updated));
      }}
    />
  );
}
