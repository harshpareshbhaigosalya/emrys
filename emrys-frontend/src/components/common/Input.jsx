export default function Input({
    label,
    type = "text",
    value,
    onChange,
    placeholder,
    required = false,
    error,
    ...props
}) {
    return (
        <div className="mb-4">
            {label && (
                <label className="block text-white/90 font-medium mb-2">
                    {label} {required && <span className="text-red-400">*</span>}
                </label>
            )}
            <input
                type={type}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                required={required}
                className={`input-field ${error ? 'border-red-500' : ''}`}
                {...props}
            />
            {error && (
                <p className="text-red-400 text-sm mt-1">{error}</p>
            )}
        </div>
    )
}
