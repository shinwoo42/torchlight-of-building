import { Modal, ModalActions, ModalButton } from "../ui/Modal";

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AboutModal = ({
  isOpen,
  onClose,
}: AboutModalProps): React.ReactNode => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="About" maxWidth="sm">
      <div className="space-y-3 mb-6 text-sm">
        <p className="text-zinc-300">
          <a
            href="https://github.com/aclinia/torchlight-of-building"
            target="_blank"
            rel="noopener noreferrer"
            className="text-amber-400 hover:text-amber-300 transition-colors"
          >
            GitHub
          </a>
        </p>
        <p className="text-zinc-300">
          <a
            href="https://discord.gg/WuyJ5fJMSj"
            target="_blank"
            rel="noopener noreferrer"
            className="text-amber-400 hover:text-amber-300 transition-colors"
          >
            Discord
          </a>
        </p>
        <p className="text-zinc-300">
          Contact: <span className="text-zinc-50">aclinia</span> on Discord
        </p>
        <p className="text-zinc-400 pt-1">
          If you're a build creator or content creator and would like your build
          to be implemented, please reach out and I'll be more than happy to do
          so.
        </p>
      </div>

      <ModalActions>
        <ModalButton onClick={onClose} variant="secondary" fullWidth>
          Close
        </ModalButton>
      </ModalActions>
    </Modal>
  );
};
