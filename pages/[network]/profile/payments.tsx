import { ChangeEvent, SetStateAction, useEffect, useState } from "react";
import { Col } from "react-bootstrap";

import { format, subDays } from "date-fns";
import { GetServerSideProps } from "next";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

import ArrowRight from "assets/icons/arrow-right";

import NothingFound from "components/nothing-found";
import PaymentsList from "components/profile/payments-list";
import ProfileLayout from "components/profile/profile-layout";
import ReactSelect from "components/react-select";

import { useAuthentication } from "contexts/authentication";
import { useNetwork } from "contexts/network";

import { formatNumberToCurrency } from "helpers/formatNumber";

import { Payment } from "interfaces/payments";

import { getCoinInfoByContract } from "services/coingecko";

import useApi from "x-hooks/use-api";

export default function Payments() {
  const { t } = useTranslation(["common", "profile"]);

  const defaultOptions = [
    {
      value: format(subDays(new Date(), 7), "yyyy-MM-dd").toString(),
      label: `7 ${t("info-data.days_other")}`,
    },
    {
      value: format(subDays(new Date(), 15), "yyyy-MM-dd").toString(),
      label: `15 ${t("info-data.days_other")}`,
    },
    {
      value: format(subDays(new Date(), 30), "yyyy-MM-dd").toString(),
      label: `30 ${t("info-data.days_other")}`,
    },
  ];

  const [totalEuro, setTotalEuro] = useState(0);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [hasNoConvertedToken, setHasNoConvertedToken] = useState(false);

  const { getPayments } = useApi();
  const { wallet } = useAuthentication();
  const { activeNetwork } = useNetwork();

  const [option, setOption] = useState<{ value: string; label: string }>(defaultOptions[0]);
  const [startDate, setStartDate] = useState<string>(format(subDays(new Date(), 7), "yyyy-MM-dd").toString());
  const [endDate, setEndDate] = useState<string>(format(new Date(), "yyyy-MM-dd").toString());

  function onChangeSelect(e: { value: string; label: string }) {
    setStartDate(e.value);
    setEndDate(format(new Date(), "yyyy-MM-dd").toString());
    setOption({
      value: e.value,
      label: e.label,
    });
  }

  async function getCoinPrice(tokenAddress) {
    return getCoinInfoByContract(tokenAddress)
      .then((tokenInfo) => tokenInfo.prices.eur)
      .catch((error) => {
        console.log(error);
        return undefined;
      });
  }

  useEffect(() => {
    if (!wallet?.address || !activeNetwork?.name) return;

    getPayments(wallet.address, activeNetwork.name, startDate, endDate).then(setPayments);
  }, [wallet?.address, activeNetwork?.name, startDate, endDate]);

  useEffect(() => {
    if (!payments?.length) return;

    Promise.all(payments.map(async (payment) => ({
        tokenAddress: payment.issue.token.address,
        value: payment.ammount,
        price: await getCoinPrice(payment.issue.token.address),
    }))).then((tokens) => {
      const totalConverted = tokens.reduce((acc, token) => acc + token.value * (token.price || 0),
                                           0);
      const noConverted = !!tokens.find((token) => token.price === undefined);

      setTotalEuro(totalConverted);
      setHasNoConvertedToken(noConverted);
    });
  }, [payments]);

  function onChangeDate(e: ChangeEvent<HTMLInputElement>,
                        setState: (value: SetStateAction<string>) => void) {
    setOption({ value: "-", label: "-" });
    setState(e.target.value);
  }

  return (
    <ProfileLayout>
      <Col xs={10}>
        <div className="d-flex flex-row align-items-center justify-content-between gap-2 mb-4">
          <h4 className="text-white">{t("main-nav.nav-avatar.payments")}</h4>
          <ReactSelect
            options={defaultOptions}
            value={option}
            onChange={onChangeSelect}
          />
            <label className="mt-2 ms-2 text-uppercase caption-small">
              {t("profile:payments.period")}
            </label>

            <input
              type="date"
              key="startDate"
              className="form-control ms-2"
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                onChangeDate(e, setStartDate)
              }
              value={startDate}
              max={endDate}
            />
            <span>
              <ArrowRight height="10px" width="10px" />
            </span>

            <input
              type="date"
              key="endDate"
              className="form-control"
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                onChangeDate(e, setEndDate)
              }
              value={endDate}
              max={format(new Date(), "yyyy-MM-dd").toString()}
            />
          {hasNoConvertedToken ? (
            <span className="caption-small text-danger">
              {t("currencies.error-convert-all-to-euro")}
            </span>
          ) : (
            <>
              <span className="caption-medium text-white mr-2">
                {t("labels.recivedintotal")}
              </span>
              <div className="caption-large bg-dark-gray py-2 px-3 border-radius-8">
                <span className="text-white">
                  {formatNumberToCurrency(totalEuro)}
                </span>

                <span className="text-gray ml-1">{t("currencies.euro")}</span>
              </div>
            </>
          )}
        </div>
        {payments?.length > 0 ? (
          <PaymentsList payments={payments} />
        ) : (
          <NothingFound description={t("filters.no-records-found")} />
        )}
      </Col>
    </ProfileLayout>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale, [
        "common",
        "profile",
        "connect-wallet-button",
        "bounty",
      ])),
    },
  };
};
