import {Arguments, CommandModule} from 'yargs';
import {Config} from '@gitsync/config';
import git, {Git} from "git-cli-wrapper";
import log from "@gitsync/log";
import commit from '@gitsync/commit-command';

let command: CommandModule = {
  handler: () => {
  }
};

command.command = 'post-commit';

command.describe = 'A git hook, use to sync the commits to relative repositories after commit.';

command.handler = async (argv) => {
  if (process.env.GITSYNC_UPDATE) {
    log.info('Gitsync is updating commit, skipping post commit.');
    return;
  }

  const source = git('.');
  const config = new Config();

  let prev;
  const revs = await source.run(['rev-list', '-n', '2', '--all']);
  if (!revs) {
    log.warn('The repository does not have any commits yet.');
    return;
  }

  switch (revs.split('\n').length) {
    case 1:
      // Git empty tree hash
      prev = '4b825dc642cb6eb9a060e54bf8d69288fbee4904';
      break;

    case 2:
      prev = 'HEAD^';
  }

  const result = await source.run(['diff', '--name-only', 'HEAD', prev]);
  log.info('Found changed files: \n' + result);

  const files = result.split("\n");
  const changedRepos = config.getReposByFiles(files);

  for (const repo of changedRepos) {
    if (repo.squash) {
      log.info(`Ignore sync squashed repository: ${repo.sourceDir}`);
      continue;
    }

    await runCommand(commit, {
      sourceDir: repo.sourceDir,
      yes: true,
    });
  }
}

async function runCommand(command: CommandModule, options: any) {
  await command.handler(options);
}

export default command;
