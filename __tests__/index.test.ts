import * as fs from 'fs';
import {logMessage, createRepo, runCommand} from '@gitsync/test';
import postCommit from '..';

describe('post-commit command', () => {
  test('run commit', async () => {
    const source = await createRepo();
    const target = await createRepo();

    await source.addFile('.gitsync.json', JSON.stringify({
      repos: [
        {
          sourceDir: 'package-name',
          target: target.dir,
        }
      ]
    }));

    await source.commitFile('package-name/test.txt');

    await runCommand(postCommit, source, {
      dir: 'package-name',
    });

    expect(fs.existsSync(target.getFile('test.txt'))).toBeTruthy();
  });

  test('run commit on repo has more than one commit', async () => {
    const source = await createRepo();
    const target = await createRepo();

    await source.commitFile('.gitsync.json', JSON.stringify({
      repos: [
        {
          sourceDir: 'package-name',
          target: target.dir,
        }
      ]
    }));

    await source.commitFile('package-name/test.txt');

    await runCommand(postCommit, source, {
      dir: 'package-name',
    });

    expect(fs.existsSync(target.getFile('test.txt'))).toBeTruthy();
  });

  test('run command on empty repo', async () => {
    const source = await createRepo();
    await runCommand(postCommit, source);

    expect(logMessage()).toContain('The repository does not have any commits yet.');
  });

  test('do not run post-commit when running update', async () => {
    const source = await createRepo();
    const target = await createRepo();

    await source.commitFile('.gitsync.json', JSON.stringify({
      repos: [
        {
          sourceDir: 'package-name',
          target: target.dir,
        }
      ]
    }));

    await source.commitFile('package-name/test.txt');

    process.env.GITSYNC_UPDATE = '1';
    await runCommand(postCommit, source, {
      dir: 'package-name',
    });

    expect(logMessage()).toContain('Gitsync is updating commit, skipping post commit.');
    expect(fs.existsSync(target.getFile('test.txt'))).toBeFalsy();
    delete process.env.GITSYNC_UPDATE;
  });

  test('ignore squashed repository', async () => {
    const source = await createRepo();
    const target = await createRepo();

    await source.addFile('.gitsync.json', JSON.stringify({
      repos: [
        {
          sourceDir: 'package-name',
          target: target.dir,
          squash: true,
        }
      ]
    }));

    await source.commitFile('package-name/test.txt');

    await runCommand(postCommit, source, {
      dir: 'package-name',
    });

    expect(fs.existsSync(target.getFile('test.txt'))).toBeFalsy();
    expect(logMessage()).toContain('Ignore sync squashed repository: package-name');
  });
});


