type PublicPageProps = {
  params: { slug: string };
};

const getMockData = (slug: string) => {
  return {
    profile: {
      displayName: slug === "yourname" ? "Your Name" : slug,
      bio: "Creator • Developer • Content",
      avatarUrl: "https://avatars.githubusercontent.com/u/1?v=4"
    },
    theme: {
      bgType: "gradient" as const,
      primaryColor: "#0ea5e9",
      secondaryColor: "#6366f1",
      buttonShape: "pill" as const
    },
    links: [
      { label: "Website", url: "https://yourwebsite.com" },
      { label: "YouTube", url: "https://youtube.com/@yourchannel" },
      { label: "Instagram", url: "https://instagram.com/yourprofile" }
    ]
  };
};

export default function PublicListPage({ params }: PublicPageProps) {
  const { slug } = params;
  const data = getMockData(slug);

  const { profile, theme, links } = data;

  const backgroundStyle =
    theme.bgType === "gradient"
      ? {
          backgroundImage: `linear-gradient(135deg, ${theme.primaryColor}, ${theme.secondaryColor})`
        }
      : { backgroundColor: theme.primaryColor };

  const buttonClasses =
    theme.buttonShape === "pill" ? "rounded-full" : "rounded-lg";

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={backgroundStyle}
    >
      <div className="w-full max-w-md bg-black/10 rounded-3xl p-6 backdrop-blur-md">
        <div className="flex flex-col items-center text-center text-white">
          <img
            src={profile.avatarUrl}
            alt={profile.displayName}
            className="w-24 h-24 rounded-full border-2 border-white/80 object-cover shadow-md"
          />
          <h1 className="mt-4 text-2xl font-semibold">
            {profile.displayName}
          </h1>
          <p className="mt-2 text-sm text-white/80">{profile.bio}</p>
        </div>

        <div className="mt-6 space-y-3">
          {links.map((link, idx) => (
            <a
              key={idx}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`block w-full ${buttonClasses} bg-white text-slate-900 text-sm font-medium py-3 px-4 text-center shadow-sm hover:shadow-md hover:-translate-y-0.5 transition`}
            >
              {link.label}
            </a>
          ))}
        </div>

        <div className="mt-6 text-center text-xs text-white/70">
          Powered by ShortTree
        </div>
      </div>
    </div>
  );
}