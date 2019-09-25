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

command.handler = async () => {
  if (process.env.GITSYNC_UPDATE) {
    log.info('Gitsync is updating commit, skipping post commit.');
    return;
  }

  const source = git('.');
  const config = new Config();

  let prev;
  const revs = await source.run(['rev-list', '-n', '2', '--all'])
  switch (revs.split('\n').length) {
    case 0:
      log.warn('The repository does not have any commits yet.');
      return;

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
    await runCommand(commit, {
      sourceDir: repo.sourceDir
    });
  }
}

async function runCommand(command: CommandModule, options: any) {
  await command.handler(Object.assign({
    $0: '',
    _: [],
  }, options));
}

export default command;
