import DOMPurify from 'dompurify';

function SafeMessage({ content, className, isStreaming = false }) {
  const sanitized = DOMPurify.sanitize(content, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br', 'ul', 'ol', 'li', 'code', 'pre', 'span'],
    ALLOWED_ATTR: ['href', 'target', 'rel', 'class']
  });

  return (
    <div className={`message-container ${className} ${isStreaming ? 'streaming' : ''}`}>
      <div
        className="message-content"
        dangerouslySetInnerHTML={{ __html: sanitized }}
      />
      {isStreaming && (
        <span className="inline-block w-2 h-4 ml-1 bg-slate-400 dark:bg-slate-500 animate-pulse"></span>
      )}
    </div>
  );
}

export default SafeMessage;