export default function InputError({ message, className = '', ...props }) {
    return message ? (
        <p
            {...props}
            className={'text-sm font-medium text-[#12355B] dark:text-slate-300 ' + className}
        >
            {message}
        </p>
    ) : null;
}
