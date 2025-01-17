import React, { useContext, useEffect, useState } from "react";
import { OverlayTrigger, Popover } from "react-bootstrap";

import TransactionIcon from "assets/icons/transaction";

import Button from "components/button";
import TransactionModal from "components/transaction-modal";
import TransactionsList from "components/transactions-list";

import { ApplicationContext } from "contexts/application";

import { TransactionStatus } from "interfaces/enums/transaction-status";
import { Transaction } from "interfaces/transaction";

export default function TransactionsStateIndicator() {
  const {
    state: { myTransactions }
  } = useContext(ApplicationContext);

  const [loading, setLoading] = useState(false);
  const [showOverlay, setShowOverlay] = useState(false);
  const [activeTransaction, setActiveTransaction] =
    useState<Transaction | null>(null);

  function updateLoadingState() {
    const loading = myTransactions.some(({ status }) => status === TransactionStatus.pending);

    setLoading(loading);
    setShowOverlay(loading);

    if (activeTransaction) {
      const tx = myTransactions.find(({ id }) => id === activeTransaction.id);
      setActiveTransaction(tx);
    }
  }

  function onActiveTransactionChange(transaction: Transaction) {
    setActiveTransaction(transaction)
  }

  const overlay = (
    <Popover id="transactions-indicator">
      <Popover.Body className="bg-shadow p-3">
        <TransactionsList onActiveTransactionChange={onActiveTransactionChange} />
      </Popover.Body>
    </Popover>
  );

  useEffect(updateLoadingState, [myTransactions]);

  return (
    <span>
      <OverlayTrigger
        trigger="click"
        placement={"bottom-end"}
        show={showOverlay}
        rootClose={true}
        onToggle={(next) => setShowOverlay(next)}
        overlay={overlay}
      >
        <div>
          <Button
            className="opacity-75 opacity-100-hover"
            transparent
            rounded
            onClick={() => setShowOverlay(!showOverlay)}
          >
            {(loading && (
              <span className="spinner-border spinner-border-sm" />
            )) || <TransactionIcon color="bg-opac" />}
          </Button>
        </div>
      </OverlayTrigger>
      <TransactionModal
        transaction={activeTransaction}
        onCloseClick={() => setActiveTransaction(null)}
      />
    </span>
  );
}
