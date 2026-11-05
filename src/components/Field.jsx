export default function Field({ label, name, value, onChange, type = 'text', error, ...rest }) {
  return (
    <div className="mb-3">
      <label className="form-label" htmlFor={name}>
        {label}
      </label>
      <input
        className={`form-control${error ? ' is-invalid' : ''}`}
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        aria-invalid={!!error}
        aria-describedby={error ? `${name}-error` : undefined}
        {...rest}
      />
      {error && (
        <div id={`${name}-error`} className="invalid-feedback">
          {error}
        </div>
      )}
    </div>
  );
}
