import React, { useEffect, useState } from 'react';

type EndorseTarget = 'DAM' | 'Deputy' | 'Approver';

interface EndorseTransactionsModalProps {
    isOpen: boolean;
    selectedCount: number;
    selectedRefs: string[];
    isSubmitting?: boolean;
    onClose: () => void;
    onConfirm: (target: EndorseTarget) => void;
}

const EndorseTransactionsModal: React.FC<EndorseTransactionsModalProps> = ({
    isOpen,
    selectedCount,
    selectedRefs,
    isSubmitting = false,
    onClose,
    onConfirm
}) => {
    const [target, setTarget] = useState<EndorseTarget | ''>('');
    const endorseTargets: EndorseTarget[] = ['DAM', 'Deputy', 'Approver'];

    const renderTargetIcon = (endorseTarget: EndorseTarget) => {
        if (endorseTarget === 'DAM') {
            return (
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                >
                    <rect x="3" y="4" width="18" height="16" rx="2" />
                    <path d="M8 2v4" />
                    <path d="M16 2v4" />
                    <path d="M3 10h18" />
                    <path d="M8 14h3" />
                </svg>
            );
        }

        if (endorseTarget === 'Deputy') {
            return (
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                >
                    <circle cx="9" cy="8" r="3" />
                    <path d="M4 19a5 5 0 0 1 10 0" />
                    <circle cx="17" cy="9" r="2.5" />
                    <path d="M14.5 19a4 4 0 0 1 5 0" />
                </svg>
            );
        }

        return (
            <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            >
                <path d="M12 3 4 7v6c0 5 3.5 7.5 8 8 4.5-.5 8-3 8-8V7z" />
                <path d="m9 12 2 2 4-4" />
            </svg>
        );
    };

    useEffect(() => {
        if (isOpen) {
            setTarget('');
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const canSubmit = target !== '' && selectedCount > 0 && !isSubmitting;

    const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget && !isSubmitting) {
            onClose();
        }
    };

    return (
        <div className="transaction-modal-backdrop" onClick={handleBackdropClick}>
            <div className="transaction-detail-modal endorse-modal">
                <div className="transaction-modal-header">
                    <h3 className="transaction-modal-title">Endorse Transactions</h3>
                    <button
                        type="button"
                        className="transaction-modal-close"
                        onClick={onClose}
                        disabled={isSubmitting}
                        aria-label="Close endorse modal"
                    >
                        X
                    </button>
                </div>

                <div className="transaction-modal-content">
                    <div className="endorse-modal-meta">
                        <p className="endorse-modal-summary">
                            You are endorsing {selectedCount} transaction{selectedCount > 1 ? 's' : ''}.
                        </p>

                        {selectedRefs.length > 0 && (
                            <div className="endorse-modal-ref-wrapper">
                                <p className="endorse-modal-refs-title">Transactions to endorse:</p>
                                <div className="endorse-modal-ref-list" aria-label="Selected transaction references">
                                    {selectedRefs.map((ref, index) => (
                                        <span key={`${ref}-${index}`} className="endorse-modal-ref-item">
                                            {ref}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    <label className="endorse-modal-label">Endorse To</label>
                    <div className="endorse-target-grid" role="radiogroup" aria-label="Endorse recipient">
                        {endorseTargets.map((endorseTarget) => {
                            const isSelected = target === endorseTarget;

                            return (
                                <button
                                    key={endorseTarget}
                                    type="button"
                                    className={`endorse-target-card ${isSelected ? 'is-selected' : ''}`}
                                    onClick={() => setTarget(endorseTarget)}
                                    disabled={isSubmitting}
                                    role="radio"
                                    aria-checked={isSelected}
                                >
                                    <span className="endorse-target-icon" aria-hidden="true">
                                        {renderTargetIcon(endorseTarget)}
                                    </span>
                                    <span className="endorse-target-name">{endorseTarget}</span>
                                </button>
                            );
                        })}
                    </div>

                    <div className="endorse-modal-actions">
                        <button
                            type="button"
                            className="transaction-edit-cancel-button"
                            onClick={onClose}
                            disabled={isSubmitting}
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            className="transaction-edit-save-button"
                            disabled={!canSubmit}
                            onClick={() => {
                                if (target) {
                                    onConfirm(target);
                                }
                            }}
                        >
                            {isSubmitting ? 'Submitting...' : 'Confirm Endorse'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EndorseTransactionsModal;
