import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  IconArrowsMaximize,
  IconBrush,
  IconCirclePlus,
  IconDownload,
  IconEraser,
  IconGitBranch,
  IconLock,
  IconNote,
  IconPalette,
  IconPlus,
  IconPointer,
  IconTrash,
  IconUpload,
  IconX,
} from '@tabler/icons-react';
import { useMora } from '../context/MoraContext.jsx';

const FOCUS_STATUSES = [
  { id: 'deep',     emoji: '🎯', label: 'Deep Focus',    hint: 'In the zone — no interruptions' },
  { id: 'thinking', emoji: '💭', label: 'Thinking',      hint: 'Processing — give me a moment' },
  { id: 'blocked',  emoji: '🚧', label: 'Blocked',       hint: 'Stuck — need to figure this out' },
  { id: 'notes',    emoji: '✍️', label: 'Taking Notes',  hint: 'Capturing — hold on' },
  { id: 'break',    emoji: '☕', label: 'Short Break',   hint: 'Back in a few minutes' },
];

const PEN_COLORS = ['#1a1a1a', '#2563EB', '#16A34A', '#DC2626', '#9333EA', '#EA580C', '#ffffff'];
const PEN_SIZES  = [2, 4, 8, 16];
const STICKY_COLORS = ['#FEF08A', '#BBF7D0', '#BAE6FD', '#FECACA', '#E9D5FF', '#FED7AA'];

function defaultNodePosition(index, total) {
  if (index === 0) return { x: 50, y: 50 };
  const angle = ((index - 1) / Math.max(1, total - 1)) * Math.PI * 2 - Math.PI / 2;
  const radius = 34;
  return { x: 50 + Math.cos(angle) * radius, y: 50 + Math.sin(angle) * radius };
}

function clampPercent(value) {
  return Math.min(92, Math.max(8, value));
}

export default function SessionWhiteboard({ taskName, subscribed, onUpgrade, isFullscreen = false }) {
  const navigate = useNavigate();
  const {
    whiteboardNodes,
    setWhiteboardNodes,
    whiteboardStickies,
    setWhiteboardStickies,
  } = useMora();

  const boardRef          = useRef(null);
  const canvasRef         = useRef(null);
  const fileInputRef      = useRef(null);
  const drawingRef        = useRef(false);
  const draggingImageRef  = useRef(null);
  const draggingNodeRef   = useRef(null);
  const draggingStickyRef = useRef(null);

  const [tool, setTool]                         = useState('draw');
  const [idea, setIdea]                         = useState('');
  const [newStickyText, setNewStickyText]       = useState('');
  const [selectedNodeId, setSelectedNodeId]     = useState('root');
  const [selectedImageId, setSelectedImageId]   = useState(null);
  const [selectedStickyId, setSelectedStickyId] = useState(null);
  const [editingStickyId, setEditingStickyId]   = useState(null);
  const [images, setImages]                     = useState([]);
  const [focusStatus, setFocusStatus]           = useState(null);
  const [showStatusPicker, setShowStatusPicker] = useState(false);
  const [drawColor, setDrawColor]               = useState('#1a1a1a');
  const [drawSize, setDrawSize]                 = useState(3);
  const [stickyColor, setStickyColor]           = useState('#FEF08A');
  const [showPalette, setShowPalette]           = useState(false);

  // Keep root node text in sync with the current task
  useEffect(() => {
    setWhiteboardNodes((current) =>
      current.map((node) => (node.id === 'root' ? { ...node, text: taskName || 'Project' } : node)),
    );
  }, [taskName]);

  // Canvas resize handler — preserves drawn content across resizes
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resize = () => {
      const rect  = canvas.getBoundingClientRect();
      const ratio = window.devicePixelRatio || 1;
      const image = canvas.toDataURL();
      canvas.width  = Math.floor(rect.width * ratio);
      canvas.height = Math.floor(rect.height * ratio);
      const ctx = canvas.getContext('2d');
      ctx.scale(ratio, ratio);
      ctx.lineCap  = 'round';
      ctx.lineJoin = 'round';
      if (image && image !== 'data:,') {
        const saved = new Image();
        saved.onload  = () => ctx.drawImage(saved, 0, 0, rect.width, rect.height);
        saved.onerror = () => {};
        saved.src = image;
      }
    };

    resize();
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, []);

  const canvasPoint = (event) => {
    const rect = canvasRef.current.getBoundingClientRect();
    return { x: event.clientX - rect.left, y: event.clientY - rect.top };
  };

  const boardPoint = (event) => {
    const rect = boardRef.current.getBoundingClientRect();
    return {
      x: ((event.clientX - rect.left) / rect.width) * 100,
      y: ((event.clientY - rect.top) / rect.height) * 100,
    };
  };

  const startDrawing = (event) => {
    if (tool !== 'draw') return;
    const ctx   = canvasRef.current.getContext('2d');
    const point = canvasPoint(event);
    ctx.strokeStyle = drawColor;
    ctx.lineWidth   = drawSize;
    ctx.lineCap     = 'round';
    ctx.lineJoin    = 'round';
    drawingRef.current = true;
    ctx.beginPath();
    ctx.moveTo(point.x, point.y);
  };

  const draw = (event) => {
    if (!drawingRef.current) return;
    const ctx   = canvasRef.current.getContext('2d');
    const point = canvasPoint(event);
    ctx.lineTo(point.x, point.y);
    ctx.stroke();
  };

  const stopDrawing = () => { drawingRef.current = false; };

  const uploadImages = (event) => {
    if (!subscribed) { onUpgrade?.(); event.target.value = ''; return; }
    const files = Array.from(event.target.files || [])
      .filter((f) => f.type.startsWith('image/'))
      .slice(0, 4);
    files.forEach((file, index) => {
      const reader = new FileReader();
      reader.onload = () => {
        const id = `img_${Date.now()}_${index}`;
        setImages((current) => [
          ...current,
          { id, src: reader.result, x: 22 + index * 10, y: 24 + index * 8, width: 34 },
        ]);
        setSelectedImageId(id);
        setTool('move');
      };
      reader.readAsDataURL(file);
    });
    event.target.value = '';
  };

  const addSticky = () => {
    const text = newStickyText.trim() || 'Double-click to edit';
    const id   = `sticky_${Date.now()}`;
    setWhiteboardStickies((current) => [
      ...current,
      { id, text, color: stickyColor, x: 20 + (current.length % 5) * 8, y: 20 + (current.length % 4) * 8 },
    ]);
    setSelectedStickyId(id);
    setNewStickyText('');
    setTool('move');
  };

  const startImageDrag = (event, image) => {
    event.preventDefault(); event.stopPropagation();
    event.currentTarget.setPointerCapture?.(event.pointerId);
    const point = boardPoint(event);
    draggingImageRef.current = { id: image.id, offsetX: point.x - image.x, offsetY: point.y - image.y };
    setSelectedImageId(image.id);
    setTool('move');
  };

  const startStickyDrag = (event, sticky) => {
    if (editingStickyId === sticky.id) return;
    event.preventDefault(); event.stopPropagation();
    event.currentTarget.setPointerCapture?.(event.pointerId);
    const point = boardPoint(event);
    draggingStickyRef.current = { id: sticky.id, offsetX: point.x - sticky.x, offsetY: point.y - sticky.y };
    setSelectedStickyId(sticky.id);
    setTool('move');
  };

  const startNodeDrag = (event, node) => {
    event.preventDefault(); event.stopPropagation();
    event.currentTarget.setPointerCapture?.(event.pointerId);
    const point = boardPoint(event);
    draggingNodeRef.current = { id: node.id, offsetX: point.x - node.x, offsetY: point.y - node.y };
    setSelectedNodeId(node.id);
    setSelectedImageId(null);
    setTool('mindmap');
  };

  const onBoardPointerMove = (event) => {
    if (draggingImageRef.current) {
      const point = boardPoint(event);
      const drag  = draggingImageRef.current;
      setImages((current) =>
        current.map((img) =>
          img.id === drag.id
            ? { ...img, x: Math.min(82, Math.max(8, point.x - drag.offsetX)), y: Math.min(82, Math.max(8, point.y - drag.offsetY)) }
            : img,
        ),
      );
    }
    if (draggingStickyRef.current) {
      const point = boardPoint(event);
      const drag  = draggingStickyRef.current;
      setWhiteboardStickies((current) =>
        current.map((s) =>
          s.id === drag.id
            ? { ...s, x: clampPercent(point.x - drag.offsetX), y: clampPercent(point.y - drag.offsetY) }
            : s,
        ),
      );
    }
    if (draggingNodeRef.current) {
      const point = boardPoint(event);
      const drag  = draggingNodeRef.current;
      setWhiteboardNodes((current) =>
        current.map((node) =>
          node.id === drag.id
            ? { ...node, x: clampPercent(point.x - drag.offsetX), y: clampPercent(point.y - drag.offsetY) }
            : node,
        ),
      );
    }
    if (drawingRef.current) draw(event);
  };

  const stopDragging = () => {
    draggingImageRef.current  = null;
    draggingNodeRef.current   = null;
    draggingStickyRef.current = null;
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const rect   = canvas.getBoundingClientRect();
    canvas.getContext('2d').clearRect(0, 0, rect.width, rect.height);
  };

  const exportBoard = () => {
    if (!subscribed) { onUpgrade?.(); return; }
    const link    = document.createElement('a');
    link.download = `${taskName || 'board'}.png`;
    link.href     = canvasRef.current.toDataURL('image/png');
    link.click();
  };

  const addIdea = (event) => {
    event.preventDefault();
    const text = idea.trim();
    if (!text) return;
    const id = `node_${Date.now()}`;
    setWhiteboardNodes((current) => {
      const parent   = current.find((node) => node.id === selectedNodeId) || current[0];
      const position = defaultNodePosition(current.length, current.length + 1);
      return [
        ...current,
        {
          id,
          parentId: selectedNodeId,
          text,
          x: clampPercent(parent.x + (position.x - 50) * 0.5),
          y: clampPercent(parent.y + (position.y - 50) * 0.5),
        },
      ];
    });
    setSelectedNodeId(id);
    setIdea('');
    setTool('mindmap');
  };

  const currentStatus = FOCUS_STATUSES.find((s) => s.id === focusStatus) ?? null;

  return (
    <section
      className={`w-full rounded-2xl border border-mora-border bg-mora-surface text-left ${
        isFullscreen ? 'flex min-h-0 flex-1 flex-col' : 'mt-6 p-4'
      }`}
    >
      {/* Header row */}
      <div className={`flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between ${isFullscreen ? 'shrink-0 px-4 pt-4 pb-2' : ''}`}>
        <div>
          <p className="text-xs text-mora-muted">Project board</p>
          <p className="mt-1 text-sm text-mora-text">Doodle, map ideas, pin notes, and let the work take shape.</p>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {/* Focus status widget — ClassroomScreen work symbols adapted for solo focus */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowStatusPicker((v) => !v)}
              className={`flex items-center gap-2 rounded-full border px-3 py-2 text-xs transition-colors ${
                currentStatus ? 'border-mora-accent bg-[#1A1F0F] text-mora-accent' : 'border-mora-border text-mora-muted'
              }`}
            >
              <span>{currentStatus?.emoji ?? '◎'}</span>
              <span>{currentStatus?.label ?? 'Set focus status'}</span>
            </button>

            {showStatusPicker && (
              <div className="absolute right-0 top-full z-30 mt-2 w-56 rounded-2xl border border-mora-border bg-mora-surface p-2 shadow-2xl">
                {FOCUS_STATUSES.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => { setFocusStatus(focusStatus === s.id ? null : s.id); setShowStatusPicker(false); }}
                    className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-mora-bg ${
                      focusStatus === s.id ? 'text-mora-accent' : 'text-mora-text'
                    }`}
                  >
                    <span className="text-base leading-none">{s.emoji}</span>
                    <div>
                      <span className="block text-xs font-medium">{s.label}</span>
                      <span className="block text-[11px] text-mora-muted">{s.hint}</span>
                    </div>
                  </button>
                ))}
                {currentStatus && (
                  <button
                    type="button"
                    onClick={() => { setFocusStatus(null); setShowStatusPicker(false); }}
                    className="mt-1 w-full rounded-xl px-3 py-2 text-center text-xs text-mora-muted hover:bg-mora-bg"
                  >
                    Clear status
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Expand to fullscreen — only shown in embedded mode */}
          {!isFullscreen && (
            <button
              type="button"
              title="Open fullscreen whiteboard"
              onClick={() => navigate('/whiteboard')}
              className="inline-flex items-center gap-1.5 rounded-full border border-mora-border px-3 py-2 text-xs text-mora-muted transition-colors hover:border-mora-accent hover:text-mora-text"
            >
              <IconArrowsMaximize size={14} stroke={1.8} />
              <span className="hidden sm:inline">Expand</span>
            </button>
          )}
        </div>
      </div>

      {/* Toolbar */}
      <div className={`flex flex-wrap gap-2 ${isFullscreen ? 'shrink-0 px-4 pb-2' : 'mt-3'}`}>
        {[
          { id: 'draw',    icon: <IconBrush size={15} stroke={1.8} />,     label: 'Draw' },
          { id: 'sticky',  icon: <IconNote size={15} stroke={1.8} />,      label: 'Sticky' },
          { id: 'mindmap', icon: <IconGitBranch size={15} stroke={1.8} />, label: 'Map' },
          { id: 'move',    icon: <IconPointer size={15} stroke={1.8} />,   label: 'Move' },
        ].map(({ id, icon, label }) => (
          <button
            key={id}
            type="button"
            onClick={() => setTool(id)}
            className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-2 text-xs ${
              tool === id ? 'border-mora-accent bg-mora-accent text-mora-bg' : 'border-mora-border text-mora-muted'
            }`}
          >
            {icon} {label}
          </button>
        ))}

        {/* Colors — paid */}
        <button
          type="button"
          onClick={() => { if (!subscribed) { onUpgrade?.(); return; } setShowPalette((v) => !v); }}
          className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-2 text-xs ${
            showPalette && subscribed ? 'border-mora-accent bg-mora-accent text-mora-bg' : 'border-mora-border text-mora-muted'
          }`}
        >
          {subscribed ? <IconPalette size={15} stroke={1.8} /> : <IconLock size={15} stroke={1.8} />} Colors
        </button>

        {/* Image upload — paid */}
        <button
          type="button"
          onClick={() => { if (!subscribed) { onUpgrade?.(); return; } fileInputRef.current?.click(); }}
          className="inline-flex items-center gap-1.5 rounded-full border border-mora-border px-3 py-2 text-xs text-mora-muted"
        >
          {subscribed ? <IconUpload size={15} stroke={1.8} /> : <IconLock size={15} stroke={1.8} />} Image
        </button>

        {/* Export PNG — paid */}
        <button
          type="button"
          onClick={exportBoard}
          className="inline-flex items-center gap-1.5 rounded-full border border-mora-border px-3 py-2 text-xs text-mora-muted"
        >
          {subscribed ? <IconDownload size={15} stroke={1.8} /> : <IconLock size={15} stroke={1.8} />} Export
        </button>

        <button
          type="button"
          onClick={clearCanvas}
          className="inline-flex items-center gap-1.5 rounded-full border border-mora-border px-3 py-2 text-xs text-mora-muted"
        >
          <IconEraser size={15} stroke={1.8} /> Erase
        </button>
      </div>

      {/* Palette panel — paid */}
      {showPalette && subscribed && (
        <div className={`flex flex-wrap items-start gap-5 rounded-2xl border border-mora-border bg-mora-bg px-4 py-3 ${isFullscreen ? 'shrink-0 mx-4 mb-2' : 'mt-2'}`}>
          <div>
            <p className="mb-2 text-[11px] text-mora-muted">Pen color</p>
            <div className="flex gap-2">
              {PEN_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setDrawColor(color)}
                  className={`h-6 w-6 rounded-full transition-transform ${drawColor === color ? 'scale-110 ring-2 ring-mora-accent ring-offset-1' : ''}`}
                  style={{ backgroundColor: color, boxShadow: color === '#ffffff' ? 'inset 0 0 0 1px #555' : undefined }}
                />
              ))}
            </div>
          </div>
          <div>
            <p className="mb-2 text-[11px] text-mora-muted">Pen size</p>
            <div className="flex items-center gap-2">
              {PEN_SIZES.map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => setDrawSize(size)}
                  className={`flex h-7 w-7 items-center justify-center rounded-full border ${drawSize === size ? 'border-mora-accent' : 'border-mora-border'}`}
                >
                  <span
                    className="rounded-full bg-mora-text"
                    style={{ width: Math.min(size * 2, 20), height: Math.min(size * 2, 20) }}
                  />
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="mb-2 text-[11px] text-mora-muted">Sticky color</p>
            <div className="flex gap-2">
              {STICKY_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setStickyColor(color)}
                  className={`h-6 w-6 rounded-md transition-transform ${stickyColor === color ? 'scale-110 ring-2 ring-mora-accent ring-offset-1' : ''}`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={uploadImages} />

      {/* Board */}
      <div
        ref={boardRef}
        className={`relative overflow-hidden rounded-2xl border border-[#D8D4C8] bg-[#F7F5F0] touch-none ${
          isFullscreen ? 'mx-4 mb-2 min-h-0 flex-1' : 'mt-3 h-[460px]'
        }`}
        onPointerMove={onBoardPointerMove}
        onPointerUp={stopDragging}
        onPointerCancel={stopDragging}
        onPointerLeave={stopDragging}
        onClick={() => setShowStatusPicker(false)}
      >
        {/* Focus status badge */}
        {currentStatus && (
          <div className="pointer-events-none absolute left-3 top-3 z-10 flex items-center gap-2 rounded-full bg-black/60 px-3 py-1.5 text-xs text-white backdrop-blur-sm">
            <span className="leading-none">{currentStatus.emoji}</span>
            <span>{currentStatus.label}</span>
          </div>
        )}

        {/* Drawing canvas */}
        <canvas
          ref={canvasRef}
          className={`absolute inset-0 h-full w-full ${tool === 'draw' ? 'cursor-crosshair' : 'pointer-events-none'}`}
          onPointerDown={startDrawing}
          onPointerMove={draw}
          onPointerUp={stopDrawing}
          onPointerCancel={stopDrawing}
          onPointerLeave={stopDrawing}
        />

        {/* Sticky notes */}
        {whiteboardStickies.map((sticky) => {
          const isSelected = selectedStickyId === sticky.id;
          const isEditing  = editingStickyId === sticky.id;
          return (
            <div
              key={sticky.id}
              onPointerDown={(e) => startStickyDrag(e, sticky)}
              onDoubleClick={() => setEditingStickyId(sticky.id)}
              className={`absolute min-h-[80px] w-28 -translate-x-1/2 -translate-y-1/2 select-none rounded-lg p-2.5 shadow-md ${
                tool === 'draw' ? 'pointer-events-none' : 'cursor-grab active:cursor-grabbing'
              } ${isSelected ? 'ring-2 ring-mora-accent ring-offset-1' : ''}`}
              style={{ left: `${sticky.x}%`, top: `${sticky.y}%`, backgroundColor: sticky.color }}
            >
              {isEditing ? (
                <textarea
                  autoFocus
                  value={sticky.text === 'Double-click to edit' ? '' : sticky.text}
                  onChange={(e) =>
                    setWhiteboardStickies((current) =>
                      current.map((s) => (s.id === sticky.id ? { ...s, text: e.target.value } : s)),
                    )
                  }
                  onBlur={() => setEditingStickyId(null)}
                  onClick={(e) => e.stopPropagation()}
                  placeholder="Note…"
                  className="h-16 w-full resize-none bg-transparent text-[11px] leading-4 text-gray-800 outline-none placeholder:text-gray-400"
                />
              ) : (
                <p className="break-words text-[11px] leading-4 text-gray-800">{sticky.text}</p>
              )}
              {isSelected && !isEditing && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setWhiteboardStickies((current) => current.filter((s) => s.id !== sticky.id));
                    setSelectedStickyId(null);
                  }}
                  className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-mora-bg text-mora-text shadow"
                >
                  <IconX size={10} stroke={2.5} />
                </button>
              )}
            </div>
          );
        })}

        {/* Uploaded images */}
        {images.map((image) => {
          const isSelected = selectedImageId === image.id;
          return (
            <div
              key={image.id}
              onPointerDown={(e) => startImageDrag(e, image)}
              className={`absolute -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-xl border bg-white ${
                isSelected ? 'border-mora-accent' : 'border-[#D8D4C8]'
              }`}
              style={{ left: `${image.x}%`, top: `${image.y}%`, width: `${image.width}%` }}
            >
              <img src={image.src} alt="" draggable="false" className="block h-auto w-full select-none" />
              {isSelected && (
                <button
                  type="button"
                  aria-label="Remove image"
                  onClick={(e) => {
                    e.stopPropagation();
                    setImages((current) => current.filter((item) => item.id !== image.id));
                    setSelectedImageId(null);
                  }}
                  className="absolute right-2 top-2 rounded-full bg-mora-bg p-1 text-mora-text shadow"
                >
                  <IconX size={14} stroke={2} />
                </button>
              )}
            </div>
          );
        })}

        {/* Mindmap connections */}
        <svg className="pointer-events-none absolute inset-0 h-full w-full">
          {whiteboardNodes
            .filter((node) => node.parentId)
            .map((node) => {
              const parent = whiteboardNodes.find((n) => n.id === node.parentId);
              if (!parent) return null;
              return (
                <line
                  key={`${node.parentId}-${node.id}`}
                  x1={`${parent.x}%`} y1={`${parent.y}%`}
                  x2={`${node.x}%`}   y2={`${node.y}%`}
                  stroke="#3d3d3d" strokeWidth="1.5" strokeDasharray="4 3"
                />
              );
            })}
        </svg>

        {/* Mindmap nodes */}
        {whiteboardNodes.map((node) => {
          const isSelected = selectedNodeId === node.id;
          const isRoot     = node.id === 'root';
          return (
            <button
              key={node.id}
              type="button"
              onPointerDown={(e) => startNodeDrag(e, node)}
              onClick={() => { setSelectedNodeId(node.id); setTool('mindmap'); }}
              className={`absolute max-w-[160px] -translate-x-1/2 -translate-y-1/2 rounded-full border px-4 py-2 text-center text-xs font-medium shadow-sm transition-shadow hover:shadow-md ${
                isSelected
                  ? 'border-transparent bg-mora-accent text-mora-bg shadow-mora-accent/30'
                  : isRoot
                  ? 'border-[#3d3d3d] bg-[#2a2a2a] text-[#f0f0f0]'
                  : 'border-[#c8c4be] bg-white text-[#2a2a2a]'
              }`}
              style={{ left: `${node.x}%`, top: `${node.y}%` }}
            >
              {node.text}
            </button>
          );
        })}
      </div>

      {/* Context-sensitive input */}
      <div className={isFullscreen ? 'shrink-0 px-4 pb-4 pt-2' : ''}>
        {tool === 'sticky' ? (
          <div className={`flex gap-2 ${isFullscreen ? '' : 'mt-3'}`}>
            <input
              value={newStickyText}
              onChange={(e) => setNewStickyText(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addSticky(); } }}
              placeholder="Sticky note text (or leave blank)"
              className="min-w-0 flex-1 rounded-full border border-mora-border bg-mora-bg px-4 py-3 text-sm outline-none transition-colors focus:border-mora-accent"
            />
            {!subscribed && (
              <div
                className="flex items-center gap-1.5 rounded-full border border-mora-border bg-mora-bg px-3 py-2 text-xs text-mora-muted"
                title="Sticky colors unlock with upgrade"
              >
                <span className="block h-4 w-4 rounded-sm" style={{ backgroundColor: '#FEF08A' }} />
              </div>
            )}
            <button
              type="button"
              onClick={addSticky}
              className="rounded-full bg-mora-accent px-4 py-3 text-mora-bg"
              aria-label="Add sticky"
            >
              <IconPlus size={18} stroke={2} />
            </button>
          </div>
        ) : (
          <form onSubmit={addIdea} className={`flex gap-2 ${isFullscreen ? '' : 'mt-3'}`}>
            <input
              value={idea}
              onChange={(e) => setIdea(e.target.value)}
              placeholder="Add an idea or branch to the map"
              className="min-w-0 flex-1 rounded-full border border-mora-border bg-mora-bg px-4 py-3 text-sm outline-none transition-colors focus:border-mora-accent"
            />
            <button
              type="submit"
              className="rounded-full bg-mora-accent px-4 py-3 text-mora-bg"
              aria-label="Add idea"
            >
              <IconPlus size={18} stroke={2} />
            </button>
          </form>
        )}

        <div className={`flex items-center justify-between gap-3 px-1 ${isFullscreen ? 'mt-2' : 'mt-3'}`}>
          <button
            type="button"
            onClick={() => {
              setWhiteboardNodes([{ id: 'root', parentId: null, text: taskName || 'Project', x: 50, y: 50 }]);
              setSelectedNodeId('root');
            }}
            className="inline-flex items-center gap-2 rounded-full border border-mora-border px-4 py-2 text-xs text-mora-muted"
          >
            <IconTrash size={14} stroke={1.8} /> Clear map
          </button>
          <span className="inline-flex items-center gap-2 text-xs text-mora-muted">
            {subscribed
              ? <><IconCirclePlus size={14} stroke={1.8} /> Colors · Images · Export</>
              : <><IconCirclePlus size={14} stroke={1.8} /> Colors, images &amp; export unlock with upgrade</>}
          </span>
        </div>
      </div>
    </section>
  );
}
