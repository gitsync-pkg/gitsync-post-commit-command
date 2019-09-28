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
  });
});


