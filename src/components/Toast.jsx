const Toast = ({ toasts }) => (
  <div className="toast-wrap" id="toastWrap">
    {toasts.map((t) => (
      <div key={t.id} className={`toast${t.isError ? ' err' : ''}`}>
        {t.msg}
      </div>
    ))}
  </div>
);

export default Toast;
