import { ButtonHTMLAttributes, DetailedHTMLProps } from "react";

export default function Button(
    { className, ...rest }: DetailedHTMLProps<ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>
) {
    return (
        <button
            className={`cursor-pointer disabled:cursor-not-allowed justify-center items-center rounded-lg border-[1.5px] flex gap-2 lg:gap-2.5 px-6 py-2 max-lg:px-2 ${className}`}
            {...rest} />
    );
}
