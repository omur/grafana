import React, { PureComponent, FC } from 'react';
import appEvents from 'app/core/app_events';
// import { dateTime } from '@grafana/data';
import { UserDTO, CoreEvents } from 'app/types';
import { cx, css } from 'emotion';
import { ConfirmButton, Input, InputStatus } from '@grafana/ui';

// const defaultTimeFormat = 'dddd YYYY-MM-DD HH:mm:ss';

interface Props {
  user: UserDTO;

  onUserUpdate: (user: UserDTO) => void;
  onUserDelete: (userId: number) => void;
  onUserDisable: (userId: number) => void;
}

interface State {
  isLoading: boolean;
}

export class UserProfile extends PureComponent<Props, State> {
  onUserDelete = () => {
    const { user, onUserDelete } = this.props;
    appEvents.emit(CoreEvents.showConfirmModal, {
      title: 'Delete user',
      text: 'Are you sure you want to delete this user?',
      yesText: 'Delete user',
      icon: 'fa-warning',
      onConfirm: () => {
        onUserDelete(user.id);
      },
    });
  };

  onUserDisable = () => {
    const { user, onUserDisable } = this.props;
    appEvents.emit(CoreEvents.showConfirmModal, {
      title: 'Disable user',
      text: 'Are you sure you want to disable this user?',
      yesText: 'Disable user',
      icon: 'fa-warning',
      onConfirm: () => {
        onUserDisable(user.id);
      },
    });
  };

  onUserNameChange = (newValue: string) => {
    const { user, onUserUpdate } = this.props;
    onUserUpdate({
      ...user,
      name: newValue,
    });
  };

  onUserEmailChange = (newValue: string) => {
    const { user, onUserUpdate } = this.props;
    onUserUpdate({
      ...user,
      email: newValue,
    });
  };

  onUserLoginChange = (newValue: string) => {
    const { user, onUserUpdate } = this.props;
    onUserUpdate({
      ...user,
      login: newValue,
    });
  };

  render() {
    const { user } = this.props;
    const lockMessage = 'Synced via LDAP';
    // const updateTime = dateTime(user.updatedAt).format(defaultTimeFormat);

    return (
      <>
        <h3 className="page-heading">User information</h3>
        <div className="gf-form-group">
          <div className="gf-form">
            <table className="filter-table form-inline">
              <tbody>
                <UserProfileRow
                  label="Name"
                  value={user.name}
                  locked={user.isExternal}
                  lockMessage={lockMessage}
                  onChange={this.onUserNameChange}
                />
                <UserProfileRow
                  label="Email"
                  value={user.email}
                  locked={user.isExternal}
                  lockMessage={lockMessage}
                  onChange={this.onUserEmailChange}
                />
                <UserProfileRow
                  label="Username"
                  value={user.login}
                  locked={user.isExternal}
                  lockMessage={lockMessage}
                  onChange={this.onUserLoginChange}
                />
                <UserProfileRow label="Password" value="******" locked={user.isExternal} lockMessage={lockMessage} />
              </tbody>
            </table>
          </div>
          <div className="gf-form-button-row">
            <button className="btn btn-danger" onClick={this.onUserDelete}>
              Delete User
            </button>
            <button className="btn btn-inverse" onClick={this.onUserDisable}>
              Disable User
            </button>
          </div>
        </div>
      </>
    );
  }
}

interface UserProfileRowProps {
  label: string;
  value?: string;
  locked?: boolean;
  lockMessage?: string;
  onChange?: (value: string) => void;
}

interface UserProfileRowState {
  value: string;
  editing: boolean;
}

export class UserProfileRow extends PureComponent<UserProfileRowProps, UserProfileRowState> {
  inputElem: HTMLInputElement;

  state = {
    editing: false,
    value: this.props.value || '',
  };

  onEditClick = () => {
    this.setState({ editing: true }, this.focusInput);
  };

  onCancelClick = () => {
    this.setState({ editing: false });
  };

  onInputChange = (event: React.ChangeEvent<HTMLInputElement>, status?: InputStatus) => {
    if (status === InputStatus.Invalid) {
      return;
    }

    this.setState({ value: event.target.value });
  };

  onInputBlur = (event: React.FocusEvent<HTMLInputElement>, status?: InputStatus) => {
    if (status === InputStatus.Invalid) {
      return;
    }

    this.setState({ value: event.target.value });
  };

  focusInput = () => {
    if (this.inputElem && this.inputElem.focus) {
      this.inputElem.focus();
    }
  };

  onSave = () => {
    if (this.props.onChange) {
      this.props.onChange(this.state.value);
    }
  };

  render() {
    const { label, value, locked } = this.props;
    const labelClass = cx(
      'width-16',
      css`
        font-weight: 500;
      `
    );
    const editButtonContainerClass = cx(
      'pull-right',
      css`
        margin-right: 0.6rem;
      `
    );

    if (locked) {
      return <LockedRow label={label} value={value} lockMessage="Synced via LDAP" />;
    }

    return (
      <tr>
        <td className={labelClass}>{label}</td>
        <td className="width-25" colSpan={2}>
          {this.state.editing ? (
            <Input className="width-20" defaultValue={value} onBlur={this.onInputBlur} onChange={this.onInputChange} />
          ) : (
            <span>{value}</span>
          )}
        </td>
        <td>
          <div className={editButtonContainerClass}>
            <ConfirmButton
              confirmText="Save"
              onClick={this.onEditClick}
              onConfirm={this.onSave}
              onCancel={this.onCancelClick}
            >
              Edit
            </ConfirmButton>
          </div>
        </td>
      </tr>
    );
  }
}

interface LockedRowProps {
  label: string;
  value?: any;
  lockMessage?: string;
}

export const LockedRow: FC<LockedRowProps> = ({ label, value, lockMessage }) => {
  const lockMessageClass = cx(
    'pull-right',
    css`
      font-style: italic;
      margin-right: 0.6rem;
    `
  );
  const labelClass = cx(
    'width-16',
    css`
      font-weight: 500;
    `
  );

  return (
    <tr>
      <td className={labelClass}>{label}</td>
      <td className="width-25" colSpan={2}>
        {value}
      </td>
      <td>
        <span className={lockMessageClass}>{lockMessage}</span>
      </td>
    </tr>
  );
};
