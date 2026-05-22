"use client";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import {
  Bold, Italic, Strikethrough, Heading1, Heading2, Heading3,
  List, ListOrdered, Link as LinkIcon, Quote, Undo, Redo, Code,
} from "lucide-react";
import { useCallback, useEffect } from "react";

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  error?: boolean;
}

function ToolbarButton({
  onClick, active, disabled, children, title,
}: {
  onClick: () => void; active?: boolean; disabled?: boolean; children: React.ReactNode; title: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`p-2 rounded min-h-[36px] min-w-[36px] flex items-center justify-center transition-colors ${
        active ? "bg-orange-500/20 text-orange-400" : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
      } disabled:opacity-30 disabled:cursor-not-allowed`}
    >
      {children}
    </button>
  );
}

export default function RichTextEditor({ value, onChange, placeholder, error }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
        bulletList: { HTMLAttributes: { class: "list-disc ml-6" } },
        orderedList: { HTMLAttributes: { class: "list-decimal ml-6" } },
        blockquote: { HTMLAttributes: { class: "border-l-4 border-orange-500/40 pl-4 italic text-slate-400" } },
        codeBlock: { HTMLAttributes: { class: "bg-black/60 rounded-lg p-3 font-mono text-sm" } },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { class: "text-orange-400 underline hover:text-orange-300", target: "_blank", rel: "noopener noreferrer" },
      }),
      Placeholder.configure({ placeholder: placeholder ?? "Comece a escrever…" }),
    ],
    content: value,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: "prose-evn min-h-[160px] sm:min-h-[240px] focus:outline-none px-3 py-3 text-base",
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value);
    }
  }, [value, editor]);

  const setLink = useCallback(() => {
    if (!editor) return;
    const previous = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("URL:", previous ?? "https://");
    if (url === null) return;
    if (url === "") { editor.chain().focus().extendMarkRange("link").unsetLink().run(); return; }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  }, [editor]);

  if (!editor) return null;

  return (
    <div className={`rounded-xl border-2 overflow-hidden transition-colors ${error ? "border-red-500" : "border-white/10 focus-within:border-orange-500"}`}
      style={{ background: "rgba(255,255,255,0.03)" }}>
      <div className="flex flex-wrap items-center gap-1 p-2 border-b border-white/10" style={{ background: "rgba(255,255,255,0.02)" }}>
        <ToolbarButton onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive("bold")} title="Negrito"><Bold className="w-4 h-4" /></ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive("italic")} title="Itálico"><Italic className="w-4 h-4" /></ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive("strike")} title="Riscado"><Strikethrough className="w-4 h-4" /></ToolbarButton>
        <span className="w-px h-6 bg-white/10 mx-1" />
        <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} active={editor.isActive("heading", { level: 1 })} title="Título 1"><Heading1 className="w-4 h-4" /></ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive("heading", { level: 2 })} title="Título 2"><Heading2 className="w-4 h-4" /></ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive("heading", { level: 3 })} title="Título 3"><Heading3 className="w-4 h-4" /></ToolbarButton>
        <span className="w-px h-6 bg-white/10 mx-1" />
        <ToolbarButton onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive("bulletList")} title="Lista"><List className="w-4 h-4" /></ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive("orderedList")} title="Lista numerada"><ListOrdered className="w-4 h-4" /></ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive("blockquote")} title="Citação"><Quote className="w-4 h-4" /></ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleCodeBlock().run()} active={editor.isActive("codeBlock")} title="Código"><Code className="w-4 h-4" /></ToolbarButton>
        <span className="w-px h-6 bg-white/10 mx-1" />
        <ToolbarButton onClick={setLink} active={editor.isActive("link")} title="Link"><LinkIcon className="w-4 h-4" /></ToolbarButton>
        <span className="w-px h-6 bg-white/10 mx-1" />
        <ToolbarButton onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()} title="Desfazer"><Undo className="w-4 h-4" /></ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()} title="Refazer"><Redo className="w-4 h-4" /></ToolbarButton>
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}
