import { render, screen } from '@testing-library/react';
import TaskForm from './TaskForm';
import { describe, it, expect, vi } from 'vitest';

describe('TaskForm', () => {
  it('renders title input field', () => {
    render(<TaskForm currentTask={null} setCurrentTask={()=>{}} refresh={false} setRefresh={()=>{}} setEditing={()=>{}} />);
    expect(screen.getByPlaceholderText('Title')).toBeInTheDocument();
  });
});