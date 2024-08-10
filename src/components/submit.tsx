import { useState } from 'react';
import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
	CardTitle,
} from './ui/card';
import { Label } from './ui/label';
import {
	SelectItem,
	SelectLabel,
	Select,
	SelectContent,
	SelectGroup,
	SelectTrigger,
	SelectValue,
} from './ui/select';
import { ScrollArea } from './ui/scroll-area';
import { SingleTask, DailyTask, MultiTask } from './task';
import { Textarea } from './ui/textarea';
import { Button } from './ui/button';
import { Input } from './ui/input';
import toast from 'react-hot-toast';

export default function Submit({
	user,
	tasks,
	verify,
	setVerify,
}: {
	user: User;
	tasks: Task[];
	verify: Verify[];
	setVerify: (v: Verify[]) => void;
}) {
	const [type, setType] = useState<string>('');
	const [selTasks, setSelTasks] = useState<Task[]>([]);
	const [selected, setSelected] = useState<Task | null>(null);
	const [amount, setAmount] = useState<number>(1);
	const [description, setDescription] = useState<string>('');

	async function singleSubmit() {
		const re = fetch(
			`/api/submit_task?id=${selected?.id}&name=${encodeURIComponent(user.name)}&amount=${amount}&description=${encodeURIComponent(description)}`,
			{
				method: 'POST',
			},
		);

		toast.promise(re, {
			loading: 'Updating...',
			success: '',
			error: '',
		});

		const res = await re;

		if (res.status == 200) {
			const ret = await res.json();
			setVerify([...verify, Array.isArray(ret) ? ret[0] : ret]);
		} else {
			toast.error(
				`We ran into an error when submitting ${selected?.name}, ${(await res.json()).message}`,
			);
		}
		setSelTasks([]);
		setSelected(null);
		setAmount(1);
		setDescription('');
	}

	async function bulkSubmit() {
		const out = selTasks.map((task) => {
			return {
				id: task.id,
				name: encodeURIComponent(user.name),
				amount: 1,
				description: encodeURIComponent(description),
			};
		});

		const re = fetch(
			`/api/bulk_task?tasks=${encodeURIComponent(JSON.stringify(out))}`,
			{
				method: 'POST',
			},
		);

		toast.promise(re, {
			loading: 'Updating...',
			success: '',
			error: '',
		});

		const res = await re;
		if (res.status == 200) {
			setVerify([...verify, ...(await res.json())]);
		} else {
			toast.error(
				`We ran into an error when submitting ${selected?.name}, ${(await res.json()).message}`,
			);
		}
		setSelTasks([]);
		setSelected(null);
		setAmount(1);
		setDescription('');
	}

	return (
		<Card className="flex h-[80vh] flex-col">
			<CardHeader>
				<CardTitle className="text-3xl">Submit</CardTitle>
			</CardHeader>
			<CardContent>
				<Label className="text-lg font-medium" id="type">
					Type
				</Label>
				<Select
					onValueChange={(s) => {
						setType(s);
						setSelTasks([]);
						setSelected(null);
						setAmount(1);
						setDescription('');
					}}>
					<SelectTrigger className="mb-4 mt-1 w-[40%]" id="type">
						<SelectValue placeholder="Select a type" />
					</SelectTrigger>
					<SelectContent>
						<SelectGroup>
							<SelectLabel>Type</SelectLabel>
							<SelectItem value="single">Single</SelectItem>
							<SelectItem value="daily">Daily</SelectItem>
							<SelectItem value="multi">Multi</SelectItem>
						</SelectGroup>
					</SelectContent>
				</Select>
				{type == 'single' ? (
					<Single
						selected={selected}
						setSelected={setSelected}
						user={user}
						tasks={tasks}
						description={description}
						setDescription={setDescription}
					/>
				) : type == 'daily' ? (
					<Daily
						selTasks={selTasks}
						setSelTasks={setSelTasks}
						user={user}
						tasks={tasks}
						description={description}
						setDescription={setDescription}
					/>
				) : type == 'multi' ? (
					<Multi
						selected={selected}
						setSelected={setSelected}
						user={user}
						tasks={tasks}
						amount={amount}
						setAmount={setAmount}
						description={description}
						setDescription={setDescription}
					/>
				) : (
					<></>
				)}
			</CardContent>
			<CardFooter className="ml-auto mt-auto">
				<Button
					disabled={selected === null || !selTasks || !description}
					onClick={() => {
						if (selected == null) bulkSubmit();
						else singleSubmit();
					}}>
					Submit
				</Button>
			</CardFooter>
		</Card>
	);
}

function Single({
	user,
	tasks,
	selected,
	setSelected,
	description,
	setDescription,
}: {
	user: User;
	tasks: Task[];
	selected: Task | null;
	setSelected: (task: Task | null) => void;
	description: string;
	setDescription: (s: string) => void;
}) {
	return (
		<>
			<Label htmlFor="tasks" className="text-lg font-medium">
				Tasks
			</Label>
			<div className="mb-4 mt-1 flex h-[30vh] flex-col">
				<div className="grid w-full grid-cols-[45%,35%,10%] gap-[5%] rounded-t-md border-x border-t px-[5%] py-2 text-lg font-medium">
					<h3>Name</h3>
					<h3>Category</h3>
					<h3>Points</h3>
				</div>
				<ScrollArea
					className="h-full w-full rounded-b-md border border-t-2"
					id="tasks">
					<div className="my-3 flex flex-col gap-3">
						{tasks
							.filter((task) => task.type === 'single')
							.filter((task) => task.scores[user.name] == 0)
							.map((task) => (
								<SingleTask
									key={task.id}
									task={task}
									selected={selected}
									setSelected={setSelected}
								/>
							))}
					</div>
				</ScrollArea>
			</div>

			<Label htmlFor="info" className="text-lg font-medium">
				More info
			</Label>
			<Textarea
				id="info"
				placeholder="Put a bit more info about your task completion"
				className="mt-1 h-max resize-none"
				onChange={(evt) => setDescription(evt.target.value)}
				value={description}
			/>
		</>
	);
}

function Daily({
	user,
	tasks,
	selTasks,
	setSelTasks,
	description,
	setDescription,
}: {
	user: User;
	tasks: Task[];
	selTasks: Task[];
	setSelTasks: (tasks: Task[]) => void;
	description: string;
	setDescription: (s: string) => void;
}) {
	return (
		<>
			<Label htmlFor="tasks" className="text-lg font-medium">
				Tasks
			</Label>
			<div className="mb-4 mt-1 flex h-[30vh] flex-col">
				<div className="grid w-full grid-cols-[40%,25%,10%,10%] gap-[5%] rounded-t-md border-x border-t px-[5%] py-2 text-lg font-medium">
					<h3>Name</h3>
					<h3>Category</h3>
					<h3>Points</h3>
					<h3>#</h3>
				</div>
				<ScrollArea
					className="h-full w-full rounded-b-md border border-t-2"
					id="tasks">
					<div className="my-3 flex flex-col gap-3">
						{tasks
							.filter((task) => task.type === 'daily')
							.map((task) => (
								<DailyTask
									key={task.id}
									user={user}
									task={task}
									selTasks={selTasks}
									setSelTasks={setSelTasks}
								/>
							))}
					</div>
				</ScrollArea>
			</div>

			<Label htmlFor="info" className="text-lg font-medium">
				More info
			</Label>
			<Textarea
				id="info"
				placeholder="Put a bit more info about your task completion"
				className="mt-1 h-max resize-none"
				onChange={(evt) => setDescription(evt.target.value)}
			/>
		</>
	);
}

function Multi({
	user,
	tasks,
	amount,
	setAmount,
	selected,
	setSelected,
	description,
	setDescription,
}: {
	user: User;
	tasks: Task[];
	amount: number;
	setAmount: (a: number) => void;
	selected: Task | null;
	setSelected: (task: Task | null) => void;
	description: string;
	setDescription: (s: string) => void;
}) {
	return (
		<>
			<Label htmlFor="tasks" className="text-lg font-medium">
				Tasks
			</Label>
			<div className="mb-4 mt-1 flex h-[30vh] flex-col">
				<div className="grid w-full grid-cols-[40%,25%,10%,10%] gap-[5%] rounded-t-md border-x border-t px-[5%] py-2 text-lg font-medium">
					<h3>Name</h3>
					<h3>Category</h3>
					<h3>Points</h3>
					<h3>#</h3>
				</div>
				<ScrollArea
					className="h-full w-full rounded-b-md border border-t-2"
					id="tasks">
					<div className="my-3 flex flex-col gap-3">
						{tasks
							.filter((task) => task.type == 'multi')
							.map((task) => (
								<MultiTask
									key={task.id}
									user={user}
									task={task}
									selected={selected}
									setSelected={setSelected}
								/>
							))}
					</div>
				</ScrollArea>
			</div>
			<div className="grid grid-cols-[75%,20%] gap-x-[5%]">
				<Label htmlFor="info" className="text-lg font-medium">
					More info
				</Label>
				<Textarea
					id="info"
					placeholder="Put a bit more info about your task completion"
					className="row-start-2 mt-1 h-max resize-none"
					onChange={(evt) => setDescription(evt.target.value)}
				/>

				<Label htmlFor="increment" className="text-lg font-medium">
					Increment
				</Label>
				<Input
					defaultValue={amount}
					className="mb-4 mt-1"
					type="number"
					onChange={(e) => {
						setAmount(+e.target.value);
					}}
					min={1}
				/>
			</div>
		</>
	);
}
