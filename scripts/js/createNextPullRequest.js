async function createNextPullRequest(github, context, sourceBranch, nextBranch, originalTitle) {
  try {
    // Remove any existing branch suffix like - [branchName]
    const cleanTitle = originalTitle.replace(/ - \[.*?\]$/, '');
    
    const capitalizedBranch = nextBranch.charAt(0).toUpperCase() + nextBranch.slice(1).toLowerCase();
    const newTitle = `${cleanTitle} - [${capitalizedBranch}]`;
    
    console.log(`Creating PR from ${sourceBranch} to ${nextBranch}`);
    console.log(`PR Title: ${newTitle}`);
    
    const pr = await github.rest.pulls.create({
      owner: context.repo.owner,
      repo: context.repo.repo,
      title: newTitle,
      body: `Automated PR to promote changes from **${sourceBranch}** to **${nextBranch}**\n\nOriginal PR: #${context.payload.pull_request.number}`,
      head: sourceBranch,
      base: nextBranch,
    });
    
    console.log(`PR created: ${pr.data.html_url}`);
    return pr.data.html_url;
  } catch (error) {
    console.error(`Error creating PR: ${error.message}`);
    throw error;
  }
}

module.exports = { createNextPullRequest };