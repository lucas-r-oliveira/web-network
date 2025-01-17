import React, { useEffect, useState } from "react";

import { useTranslation } from "next-i18next";

import ReactSelect from "components/react-select";

import { useRepos } from "contexts/repos";

export default function ReposDropdown({ onSelected, value, disabled }: {
  onSelected: (e: { value: { id: string; path: string; } }) => void,
  value?: { label: string, value: { id: string, path: string } }
  disabled?: boolean;
}) {
  const { repoList } = useRepos();
  const [options, setOptions] = useState<{ value: { id: string, path: string }; label: string }[]>();
  const [option, setOption] = useState<{ value: { id: string, path: string }; label: string }>()
  const { t } = useTranslation("common");

  function loadReposFromBackend() {
    if (!repoList) return;

    function mapRepo({ id: value, githubPath: label }) {
      return { value: { id: value, path: label }, label };
    }

    setOptions(repoList.map(mapRepo));
  }

  useEffect(loadReposFromBackend, [repoList]);
  useEffect(() => { value?.label && setOption(value) }, [value]);

  function onChangeSelect(e: { value: { id: string; path: string } }) {
    onSelected(e)
    setOption({
      value: e.value,
      label: e.value.path
    })
  }

  return (
    <div>
      <label className="caption-small mb-2 text-uppercase">
        {t("select-a-repository")}
      </label>
      <ReactSelect
        options={options}
        value={option}
        onChange={onChangeSelect}
        placeholder={t("forms.select-placeholder")}
        isDisabled={disabled}
      />
    </div>
  );
}
