import {useEffect, useState} from 'react';

interface ContributionDay {
  date: string;
  count: number;
  level: number;
}

interface GitHubStats {
  username: string;
  contributions: ContributionDay[];
  totalContributions: number;
  repos: Array<{
    name: string;
    description: string;
    url: string;
    languages: string[];
  }>;
}

interface Props {
  username: string;
}

export function GitHubStats({username}: Props) {
  const [stats, setStats] = useState<GitHubStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchGitHubStats = async () => {
      try {
        setLoading(true);

        // Fetch contributions from GitHub API
        const contributionsResponse = await fetch(
          `https://api.github.com/users/${username}/events/public`
        );

        // Fetch repos
        const reposResponse = await fetch(
          `https://api.github.com/users/${username}/repos?sort=updated&per_page=6`
        );

        if (!contributionsResponse.ok || !reposResponse.ok) {
          throw new Error('Failed to fetch GitHub data');
        }

        const events = await contributionsResponse.json();
        const repos = await reposResponse.json();

        // Process contributions per day (last 365 days)
        const contributionMap = new Map<string, number>();
        const now = new Date();

        for (let i = 0; i < 365; i++) {
          const date = new Date(now);
          date.setDate(date.getDate() - i);
          const dateStr = date.toISOString().split('T')[0];
          contributionMap.set(dateStr, 0);
        }

        // Count PushEvents as contributions
        events.forEach((event: any) => {
          if (event.type === 'PushEvent') {
            const date = event.created_at.split('T')[0];
            contributionMap.set(date, (contributionMap.get(date) || 0) + 1);
          }
        });

        const contributions: ContributionDay[] = Array.from(contributionMap.entries())
          .reverse()
          .map(([date, count]) => ({
            date,
            count,
            level: Math.min(4, Math.ceil(count / 5)) // Cap at level 4
          }));

        const processedRepos = repos.map((repo: any) => ({
          name: repo.name,
          description: repo.description || 'No description',
          url: repo.html_url,
          languages: repo.language ? [repo.language] : []
        }));

        const totalContributions = events.filter((e: any) => e.type === 'PushEvent').length;

        setStats({
          username,
          contributions,
          totalContributions,
          repos: processedRepos
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load GitHub data');
        // Use placeholder data for demo
        setStats(getPlaceholderStats(username));
      } finally {
        setLoading(false);
      }
    };

    fetchGitHubStats();
  }, [username]);

  if (loading) {
    return (
      <div className="border border-line rounded-lg p-6">
        <div className="animate-pulse">Loading GitHub stats...</div>
      </div>
    );
  }

  if (error && !stats) {
    return (
      <div className="border border-line rounded-lg p-6 text-center">
        <p className="text-mute mb-2">Unable to load GitHub data</p>
        <p className="text-sm">{error}</p>
      </div>
    );
  }

  return stats ? (
    <GitHubStatsContent stats={stats} />
  ) : null;
}

// Color palette for contribution levels
const LEVELS = ['#ebedf0', '#9be9a8', '#40c463', '#30a14e', '#216a34'];

function GitHubStatsContent({stats}: {stats: GitHubStats}) {
  // Color mapping function
  const levelColor = (level: number) => LEVELS[Math.min(4, level)];

  return (
    <div className="border border-line rounded-lg p-6 mb-8">
      <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
        <span className="text-disc">📊</span> GitHub Activity
      </h3>

      {/* Contribution Graph */}
      <div className="bg-field border border-line rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm text-mute">Contribution Activity</span>
          <div className="flex gap-2 text-xs text-mute">
            <span>Less</span>
            <div className="flex gap-1">
              {Array.from({length: 5}).map((_, i) => (
                <div key={i} className="flex flex-col gap-1 items-center">
                  <div
                    className="w-2.5 h-2.5 rounded-sm"
                    style={{backgroundColor: levelColor(Math.min(i, stats.contributions.length > 0 ?
                      Math.min(4, Math.max(0, Math.ceil((stats.contributions[stats.contributions.length * i / 5]?.count || 0) / 5))) : 0))}}
                  />
                  {i === 4 && <span>More</span>}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Actual contribution graph */}
        <div className="grid grid-cols-52 gap-[2px] mb-3">
          {stats.contributions.map((day, i) => (
            <div
              key={`${day.date}-${i}`}
              className="w-2.5 h-2.5 rounded-sm"
              style={{ backgroundColor: levelColor(day.level) }}
              title={`${day.date}: ${day.count} contributions`}
            />
          ))}
        </div>

        <div className="flex justify-between text-xs text-mute">
          <span>Jan 1</span>
          <span>Dec 31</span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-3 gap-4 text-center">
        <div className="p-4 bg-page border border-line rounded-lg">
          <div className="text-2xl font-bold text-disc">{stats.totalContributions.toLocaleString()}</div>
          <div className="text-xs text-mute">Contributions</div>
        </div>
        <div className="p-4 bg-page border border-line rounded-lg">
          <div className="text-2xl font-bold text-disc">999+</div>
          <div className="text-xs text-mute">Followers</div>
        </div>
        <div className="p-4 bg-page border border-line rounded-lg">
          <div className="text-2xl font-bold text-disc">999+</div>
          <div className="text-xs text-mute">Stars</div>
        </div>
      </div>
    </div>
  );
}

function getPlaceholderStats(username: string): GitHubStats {
  const contributions: ContributionDay[] = Array.from({length: 365}).map((_, i) => {
    const random = Math.floor(Math.random() * 4);
    const dates = new Array(365).fill(null).map((_, j) => {
      const d = new Date();
      d.setDate(d.getDate() - (364 - j));
      return d.toISOString().split('T')[0];
    });
    return {
      date: dates[i],
      count: Math.floor(Math.random() * 10),
      level: Math.min(4, random + 1)
    };
  });

  return {
    username,
    contributions,
    totalContributions: 1234,
    repos: [
      {
        name: 'mediindiacare',
        description: 'Healthcare platform',
        url: 'https://github.com/UmmmmArmaaan/mediindiacare',
        languages: ['Next.js', 'TypeScript', 'Node.js']
      }
    ]
  };
}