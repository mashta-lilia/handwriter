import React from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import TextAlign from '@tiptap/extension-text-align'
import Image from '@tiptap/extension-image'
import {Table} from '@tiptap/extension-table'
import TableRow from '@tiptap/extension-table-row'
import TableCell from '@tiptap/extension-table-cell'
import TableHeader from '@tiptap/extension-table-header'
import { Editor } from '@tiptap/react'

interface RichEditorProps {
  onChange?: (html: string) => void
}

const ToolbarButton = ({
  onClick,
  active,
  title,
  children,
}: {
  onClick: () => void
  active?: boolean
  title: string
  children: React.ReactNode
}) => {
  const [tooltip, setTooltip] = React.useState<{ x: number; y: number } | null>(null)

  return (
    <div
      className="relative"
      onMouseEnter={(e) => {
        const rect = e.currentTarget.getBoundingClientRect()
        setTooltip({
          x: rect.left + rect.width / 2,
          y: rect.top - 8,
        })
      }}
      onMouseLeave={() => setTooltip(null)}
    >
      <button
        type="button"
        onClick={onClick}
        className={[
          'w-8 h-8 flex items-center justify-center font-mono text-xs transition-all clip-cyber-sm',
          active
            ? 'bg-cyber-cyan text-cyber-bg'
            : 'text-cyber-text hover:text-cyber-cyan hover:bg-cyber-muted',
        ].join(' ')}
      >
        {children}
      </button>

      {tooltip && (
        <div
          style={{
            position: 'fixed',
            left: tooltip.x,
            top: tooltip.y,
            transform: 'translate(-50%, -100%)',
            zIndex: 9999,
          }}
          className="px-2 py-1 bg-cyber-bg border border-cyber-cyan font-mono text-[10px] text-cyber-cyan uppercase tracking-widest whitespace-nowrap pointer-events-none"
        >
          {title}
          <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-cyber-cyan" />
        </div>
      )}
    </div>
  )
}
const Divider = () => (
  <div className="w-px h-6 bg-cyber-muted mx-1" />
)

export default function RichEditor({ onChange }: RichEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Image,
      Table.configure({ resizable: true }),
      TableRow,
      TableCell,
      TableHeader,
    ],
    content: '<p>Paste your notes here...</p>',
    onUpdate: ({ editor }: { editor: Editor }) => {
      onChange?.(editor.getHTML())
    },
    editorProps: {
      attributes: {
        class: 'outline-none min-h-full p-4 font-mono text-sm text-cyber-text prose-invert',
      },
    },
  })

  if (!editor) return null

  const addImage = () => {
    const url = prompt('Image URL:')
    if (url) editor.chain().focus().setImage({ src: url }).run()
  }

  const addTable = () => {
    editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()
  }

  const addFormula = () => {
    const formula = prompt('Enter formula (e.g. E=mc²):')
    if (formula) {
      editor.chain().focus().insertContent(`<code>${formula}</code>`).run()
    }
  }

  return (
    <div className="flex flex-col flex-1 border border-cyber-muted bg-cyber-surface overflow-hidden">
      {/* Toolbar */}
<div className="flex flex-wrap items-center gap-0.5 p-2 border-b border-cyber-muted bg-cyber-bg overflow-visible">

        {/* Text style */}
        <ToolbarButton onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')} title="Bold">
          <strong>B</strong>
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')} title="Italic">
          <em>I</em>
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive('underline')} title="Underline">
          <span className="underline">U</span>
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive('strike')} title="Strikethrough">
          <span className="line-through">S</span>
        </ToolbarButton>

        <Divider />

        {/* Headings */}
        <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} active={editor.isActive('heading', { level: 1 })} title="Heading 1">
          H1
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive('heading', { level: 2 })} title="Heading 2">
          H2
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().setParagraph().run()} active={editor.isActive('paragraph')} title="Paragraph">
          ¶
        </ToolbarButton>

        <Divider />

        {/* Lists */}
        <ToolbarButton onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive('bulletList')} title="Bullet List">
          •≡
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive('orderedList')} title="Numbered List">
          1≡
        </ToolbarButton>

        <Divider />

        {/* Alignment */}
        <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('left').run()} active={editor.isActive({ textAlign: 'left' })} title="Align Left">
          ⬅
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('center').run()} active={editor.isActive({ textAlign: 'center' })} title="Align Center">
          ↔
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('right').run()} active={editor.isActive({ textAlign: 'right' })} title="Align Right">
          ➡
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('justify').run()} active={editor.isActive({ textAlign: 'justify' })} title="Justify">
          ≡
        </ToolbarButton>

        <Divider />

        {/* Insert */}
        <ToolbarButton onClick={addImage} title="Insert Image">
          🖼
        </ToolbarButton>
        <ToolbarButton onClick={addTable} title="Insert Table">
          ⊞
        </ToolbarButton>
        <ToolbarButton onClick={addFormula} title="Insert Formula">
          ƒx
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive('blockquote')} title="Blockquote">
          "
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleCode().run()} active={editor.isActive('code')} title="Inline Code">
          {'<>'}
        </ToolbarButton>

        <Divider />

        {/* History */}
        <ToolbarButton onClick={() => editor.chain().focus().undo().run()} title="Undo">
          ↩
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().redo().run()} title="Redo">
          ↪
        </ToolbarButton>

      </div>

      {/* Editor area */}
      <EditorContent
        editor={editor}
        className="flex-1 overflow-y-auto [&_.ProseMirror]:min-h-full [&_.ProseMirror_table]:border-collapse [&_.ProseMirror_td]:border [&_.ProseMirror_td]:border-cyber-muted [&_.ProseMirror_td]:p-2 [&_.ProseMirror_th]:border [&_.ProseMirror_th]:border-cyber-cyan [&_.ProseMirror_th]:p-2 [&_.ProseMirror_th]:bg-cyber-muted [&_.ProseMirror_blockquote]:border-l-2 [&_.ProseMirror_blockquote]:border-cyber-cyan [&_.ProseMirror_blockquote]:pl-4 [&_.ProseMirror_blockquote]:text-cyber-muted"
      />
    </div>
  )
}