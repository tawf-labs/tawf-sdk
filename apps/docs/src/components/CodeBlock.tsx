export default function CodeBlock({ code }: { code: string }) {
  return (
    <pre className="bg-tawf-ink text-tawf-sand p-6 rounded-2xl overflow-x-auto text-sm leading-relaxed border border-white/10">
      {code}
    </pre>
  );
}