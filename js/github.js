export async function fetchGitHubData() {
    try {
        const res = await fetch("https://api.github.com/users/rohall12");
        if (res.ok) {
            const data = await res.json();
            const repos = document.getElementById("github-repos");
            const followers = document.getElementById("github-followers");
            if (repos) repos.textContent = data.public_repos;
            if (followers) followers.textContent = data.followers;
        }
    } catch (err) {
        console.error("GitHub API Error:", err);
    }
}