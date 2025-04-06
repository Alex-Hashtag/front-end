import React from "react";

interface Props
{
    title: string
    children: React.ReactNode
}

export default function Section({title, children}: Props) {
    return (
        <section className="section">
            <h2 className="section-title">{title}</h2>
            {children}
        </section>
    )
}
