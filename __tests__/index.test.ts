import * as fs from 'fs';
import {createRepo, removeRepos, disableColor, runCommand, catchError} from '@gitsync/test';
import postCommit from '..';

beforeAll(() => {
  disableColor();
});

afterAll(() => {
  removeRepos();
});

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
});


