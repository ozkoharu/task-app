import React from 'react';
import { render, screen } from '@testing-library/react';
import { ReactFlowProvider } from '@xyflow/react';
import { TaskNode, TaskNodeData } from '@/components/taskmap/TaskNode';

// Wrapper to provide React Flow context
const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <ReactFlowProvider>{children}</ReactFlowProvider>
);

const mockNodeProps = (data: Partial<TaskNodeData> = {}) => ({
  id: 'test-node',
  data: {
    id: 'task1',
    name: 'Test Task',
    traderName: 'Prapor',
    traderId: 'prapor',
    minPlayerLevel: 1,
    wikiLink: 'https://wiki.example.com/test',
    isCompleted: false,
    isAvailable: true,
    ...data,
  } as TaskNodeData,
  type: 'taskNode',
  xPos: 0,
  yPos: 0,
  isConnectable: true,
  zIndex: 0,
  positionAbsoluteX: 0,
  positionAbsoluteY: 0,
  dragging: false,
  selected: false,
  sourcePosition: undefined,
  targetPosition: undefined,
});

describe('TaskNode', () => {
  it('renders task name', () => {
    render(<TaskNode {...mockNodeProps()} />, { wrapper: Wrapper });

    expect(screen.getByText('Test Task')).toBeInTheDocument();
  });

  it('renders trader name', () => {
    render(<TaskNode {...mockNodeProps()} />, { wrapper: Wrapper });

    expect(screen.getByText('Prapor')).toBeInTheDocument();
  });

  it('renders required level', () => {
    render(<TaskNode {...mockNodeProps({ minPlayerLevel: 5 })} />, { wrapper: Wrapper });

    expect(screen.getByText('Lv.5')).toBeInTheDocument();
  });

  it('applies completed styles when isCompleted is true', () => {
    const { container } = render(
      <TaskNode {...mockNodeProps({ isCompleted: true })} />,
      { wrapper: Wrapper }
    );

    const nodeElement = container.firstChild as HTMLElement;
    expect(nodeElement.className).toContain('bg-green');
  });

  it('applies available styles when isAvailable is true and not completed', () => {
    const { container } = render(
      <TaskNode {...mockNodeProps({ isCompleted: false, isAvailable: true })} />,
      { wrapper: Wrapper }
    );

    const nodeElement = container.firstChild as HTMLElement;
    expect(nodeElement.className).toContain('bg-tarkov-bg');
  });

  it('applies locked styles when not available and not completed', () => {
    const { container } = render(
      <TaskNode {...mockNodeProps({ isCompleted: false, isAvailable: false })} />,
      { wrapper: Wrapper }
    );

    const nodeElement = container.firstChild as HTMLElement;
    expect(nodeElement.className).toContain('opacity-60');
  });

  it('applies line-through to completed task name', () => {
    render(<TaskNode {...mockNodeProps({ isCompleted: true })} />, { wrapper: Wrapper });

    const taskName = screen.getByText('Test Task');
    expect(taskName.className).toContain('line-through');
  });

  it('does not apply line-through to incomplete task name', () => {
    render(<TaskNode {...mockNodeProps({ isCompleted: false })} />, { wrapper: Wrapper });

    const taskName = screen.getByText('Test Task');
    expect(taskName.className).not.toContain('line-through');
  });

  describe('trader color coding', () => {
    it('applies red border for prapor', () => {
      const { container } = render(
        <TaskNode {...mockNodeProps({ traderId: 'prapor', isAvailable: true })} />,
        { wrapper: Wrapper }
      );

      const nodeElement = container.firstChild as HTMLElement;
      expect(nodeElement.className).toContain('border-red');
    });

    it('applies blue border for skier', () => {
      const { container } = render(
        <TaskNode {...mockNodeProps({ traderId: 'skier', isAvailable: true })} />,
        { wrapper: Wrapper }
      );

      const nodeElement = container.firstChild as HTMLElement;
      expect(nodeElement.className).toContain('border-blue');
    });
  });
});
