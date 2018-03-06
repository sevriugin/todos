import { Template } from 'meteor/templating';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { $ } from 'meteor/jquery';
import { _ } from 'meteor/underscore';

import './token-item.html';
import { Todos } from '../../api/todos/todos.js';

import {
  setCheckedStatus,
  updateText,
  remove,
  updateContract,
} from '../../api/todos/methods.js';

import { displayError } from '../lib/errors.js';

Template.Token_item.onCreated(function tokenItemOnCreated() {
  this.autorun(() => {
    new SimpleSchema({
      todo: { type: Todos._helpers },
      editing: { type: Boolean, optional: true },
      onEditingChange: { type: Function },
      onEditingToken: { type: Function },
    }).validate(Template.currentData());
  });
});

Template.Token_item.helpers({
  checkedClass(todo) {
    return todo.checked && 'checked';
  },
  editingClass(editing) {
    return editing && 'editing';
  },
  iconClass(value) {
    if (value) {
      return 'icon-close';
    }
    return 'icon-add';
  },
  contract(todo) {
    return todo.contract();
  },
});

Template.Token_item.events({
  'change [type=checkbox]'(event) {
    const checked = $(event.target).is(':checked');

    setCheckedStatus.call({
      todoId: this.todo._id,
      newCheckedStatus: checked,
    });
  },

  'focus #text'() {
    this.onEditingChange(true);
  },

  'blur #text'() {
    if (this.editing) {
      this.onEditingChange(false);
    }
  },

  'keydown #text'(event) {
    // ESC or ENTER
    if (event.which === 27 || event.which === 13) {
      event.preventDefault();
      event.target.blur();
    }
  },

  // update the text of the item on keypress but throttle the event to ensure
  // we don't flood the server with updates (handles the event at most once
  // every 300ms)
  'keyup #text': _.throttle(function todosItemKeyUpInner(event) {
    updateText.call({
      todoId: this.todo._id,
      newText: event.target.value,
    }, displayError);
  }, 300),

  // handle mousedown otherwise the blur handler above will swallow the click
  // on iOS, we still require the click event so handle both
  'mousedown .js-delete-item, click .js-delete-item'() {
    remove.call({
      todoId: this.todo._id,
    }, displayError);
  },
  'mousedown .js-edit-item, click .js-edit-item'() {
    this.onEditingToken(true);
  },
  'mousedown .js-cancel-token, click .js-cancel-token'() {
    this.onEditingToken(false);
  },
  'click .js-token-edit'(event, instance) {
    const $input = $(event.target).prev();
    const $icon = $(event.target);
    if ($icon.hasClass('icon-close')) {
      $input.val('');
      $icon.removeClass('icon-close');
      $icon.addClass('icon-add');
    }
    $input.focus();
  },
  'mousedown .js-sync-token, click .js-sync-token'(event, instance) {
    event.preventDefault();

    const contract = instance.$('#contract').val().trim();
    if (contract) {
      if (!this.todo.getContract(contract)) {
        console.log(`contract name [${contract}] not found`);
        alert(`contract name [${contract}] not found`);
        return;
      }
    }
    const balance = instance.$('#balance').val().trim();

    const update = { todoId: this.todo._id };

    if (contract) { update.smartcontract = contract; }
    if (balance) { update.balance = parseInt(balance); }
    updateContract.call(update);

    this.onEditingToken(false);
  },
});
