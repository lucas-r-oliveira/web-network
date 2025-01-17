import React, {
  createContext,
  useCallback,
  useState,
  useContext,
  useMemo,
  useEffect
} from "react";

import { useRouter } from "next/router";

import { changeLoadState } from "contexts/reducers/change-load-state";

import { BranchInfo, BranchsList } from "interfaces/branchs-list";
import {
  ReposList,
  RepoInfo,
  ForksList,
  ForkInfo
} from "interfaces/repos-list";

import useApi from "x-hooks/use-api";
import useOctokit from "x-hooks/use-octokit";

import { ApplicationContext } from "./application";
import { useNetwork } from "./network";

interface IActiveRepo extends RepoInfo {
  forks: ForkInfo[];
  branchs: BranchInfo[];
  hasGhVisibility: boolean;
}

export type RepoListByNetwork = {
  [networkName: string]: {
    repos: ReposList;
    lastUpdated: number;
  };
};

export interface ReposContextData {
  repoList: ReposList;
  forksList: ForksList;
  branchsList: BranchsList;
  activeRepo: IActiveRepo;
  loadRepos: () => Promise<ReposList>;
  updateActiveRepo: (repoId: number) => Promise<IActiveRepo>;
  findForks: (repoId: number) => Promise<ForkInfo[]>;
  findBranch: (repoId: number, forced?: boolean) => Promise<BranchInfo[]>;
  findRepo: (repoId: number) => RepoInfo;
}

const TTL = 60 * 5 * 100; // 5 Min

const ReposContext = createContext<ReposContextData>({} as ReposContextData);

export const ReposProvider: React.FC = function ({ children }) {
  const [repoList, setRepoList] = useState<RepoListByNetwork>({});
  const [branchsList, setBranchsList] = useState<BranchsList>({});
  const [forksList, setForksList] = useState<ForksList>({});
  const [activeRepo, setActiveRepo] = useState<IActiveRepo>(null);

  const { getReposList } = useApi();
  const { dispatch } = useContext(ApplicationContext);
  const { activeNetwork } = useNetwork();
  const { getRepository, getRepositoryForks, getRepositoryBranches } = useOctokit();
  const { query } = useRouter();

  const findRepo = (repoId: number): RepoInfo =>
    repoList[activeNetwork?.name]?.repos?.find(({ id }) => +id === +repoId);
  const isLoadedReposByNetwork = (): boolean =>
    repoList[activeNetwork?.name]?.repos?.length > 0;

  const findForks = useCallback(async (repoId: number, forced?: boolean): Promise<ForkInfo[]> => {
    if (forksList[repoId] && !forced) return forksList[repoId];
    const repo = findRepo(repoId);

    if (!repo) throw new Error("Repo not found");

    const forks = await getRepositoryForks(repo?.githubPath);

    if (!forks) return [];

    setForksList((prevState) => ({
        ...prevState,
        [repoId]: forks
    }));

    return forks;
  },
    [forksList, findRepo]);

  const findBranch = useCallback(async (repoId: number, forced?: boolean): Promise<BranchInfo[]> => {
    if (branchsList[repoId] && !forced) return branchsList[repoId];

    const repoPath = findRepo(repoId)?.githubPath;
    if (!repoPath) return [];

    const response = await getRepositoryBranches(repoPath, forced);
    const branches = response.map(branch => ({ branch }));

    setBranchsList((prevState) => ({
        ...prevState,
        [repoId]: branches
    }));
    return branches;
  },
    [activeNetwork, branchsList]);

  const loadRepos = useCallback(async (): Promise<ReposList> => {
    if (!activeNetwork?.name) throw new Error("Network not exists");

    const noExpired =
      +new Date() - repoList[activeNetwork?.name]?.lastUpdated <= TTL;

    if (repoList[activeNetwork?.name] && noExpired)
      return repoList[activeNetwork?.name].repos;

    dispatch(changeLoadState(true));

    const repos = (await getReposList(false, activeNetwork?.name)) as ReposList;

    if (!repos) throw new Error("Repos not found");

    setRepoList((prevState) => ({
      ...prevState,
      [activeNetwork?.name]: {
        repos: repos?.map(repo => {
          const [owner, name] = repo.githubPath.split("/");

          return {...repo, owner, name};
        }),
        lastUpdated: +new Date()
      }
    }));

    dispatch(changeLoadState(false));
    return repos;
  }, [activeNetwork, repoList]);

  const updateActiveRepo = useCallback(async (repoId: number): Promise<IActiveRepo> => {
    if (activeRepo?.id === repoId) return activeRepo;

    const findedRepo = findRepo(repoId);

    if (!findedRepo) throw new Error("Repo not found");

    const noExpired =
        +new Date() - repoList[activeNetwork?.name].lastUpdated <= TTL;

    const ghRepository = await getRepository(findedRepo?.githubPath);

    const newActiveRepo = {
        ...findedRepo,
        hasGhVisibility: !!ghRepository,
        forks: [],
        branchs: []
    };

    if(newActiveRepo.hasGhVisibility){
      const [branchs, forks] = await Promise.all([
        findBranch(+findedRepo?.id, !noExpired),
        findForks(+findedRepo?.id, !noExpired)
      ]);

      newActiveRepo.branchs = branchs;
      newActiveRepo.forks = forks;
    }

    setActiveRepo(newActiveRepo);
    return newActiveRepo;
  },
    [findForks, findRepo, repoList, activeNetwork, activeRepo]);

  useEffect(() => {
    if (query?.repoId && isLoadedReposByNetwork()) {
      updateActiveRepo(+query?.repoId);
    }
  }, [repoList, query]);

  /**
   * Load Repos Every Change Network;
   */
  useEffect(() => {
    if (activeNetwork?.name) {
      loadRepos();
    }
  }, [activeNetwork]);

  const memorizeValue = useMemo<ReposContextData>(() => ({
      repoList: repoList[activeNetwork?.name]?.repos,
      branchsList,
      activeRepo,
      forksList,
      loadRepos,
      findForks,
      findBranch,
      updateActiveRepo,
      findRepo
  }),
                                                  [
      activeNetwork,
      repoList,
      branchsList,
      activeRepo,
      forksList,
      loadRepos,
      findForks,
      findBranch,
      updateActiveRepo,
      findRepo
                                                  ]);

  return (
    <ReposContext.Provider value={memorizeValue}>
      {children}
    </ReposContext.Provider>
  );
};

export function useRepos(): ReposContextData {
  const context = useContext(ReposContext);

  if (!context) {
    throw new Error("useRepos must be used within an ReposProvider");
  }

  return context;
}
