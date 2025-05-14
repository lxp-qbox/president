import React from 'react';
import { CheckCircle, XCircle, Ban } from 'lucide-react';
import Modal from '../../../components/UI/Modal';
import Button from '../../../components/UI/Button';
import type { User } from '../../../types/user';

interface StatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
  onStatusChange: (status: User['status']) => void;
}

const StatusModal: React.FC<StatusModalProps> = ({
  isOpen,
  onClose,
  user,
  onStatusChange,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Alterar Status - ${user.profile}`}
      size="sm"
    >
      <div className="space-y-4">
        <p className="text-gray-600 mb-4">
          Selecione a ação que deseja realizar para este usuário:
        </p>
        
        <div className="space-y-2">
          <Button
            variant="success"
            className="w-full justify-start"
            leftIcon={<CheckCircle className="w-5 h-5" />}
            onClick={() => {
              onStatusChange('approved');
              onClose();
            }}
            disabled={user.status === 'approved'}
          >
            Aprovar Usuário
          </Button>
          
          <Button
            variant="danger"
            className="w-full justify-start"
            leftIcon={<XCircle className="w-5 h-5" />}
            onClick={() => {
              onStatusChange('rejected');
              onClose();
            }}
            disabled={user.status === 'rejected'}
          >
            Reprovar Usuário
          </Button>
          
          <Button
            variant="outline"
            className="w-full justify-start"
            leftIcon={<Ban className="w-5 h-5" />}
            onClick={() => {
              onStatusChange('banned');
              onClose();
            }}
            disabled={user.status === 'banned'}
          >
            Banir Usuário
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default StatusModal;