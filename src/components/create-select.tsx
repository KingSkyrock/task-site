import { z } from 'zod';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { IoCreateOutline } from 'react-icons/io5';
import { RiEditLine } from 'react-icons/ri';
import { Button } from './ui/button';

import { Trash2 } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import TaskHoverCard from './task-hover';
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectLabel,
	SelectTrigger,
	SelectValue,
} from './ui/select';
import { Textarea } from './ui/textarea';
import { ToggleGroup, ToggleGroupItem } from './ui/toggle-group';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from './ui/form';

export function CreateSelect({
	tasks,
	setTasks,
}: {
	tasks: Task[];
	setTasks: (t: Task[]) => void;
}) {
	return (
		<ScrollArea className="h-[27.5vh] rounded-md border">
			<div className="px-4 py-2">
				{tasks.map((task) => (
					<div key={task.id}>
						<div className="flex flex-row items-center justify-between gap-4">
							<TaskHoverCard task={task} className="text-sm font-normal" />
							<TaskDialog task={task} tasks={tasks} setTasks={setTasks} />
						</div>
						<Separator className="my-2" />
					</div>
				))}
				<TaskDialog tasks={tasks} setTasks={setTasks} />
			</div>
		</ScrollArea>
	);
}

const formSchema = z.object({
	name: z
		.string()
		.min(1, { message: 'Name must be a minimum of 1 character.' })
		.max(64, { message: 'Name must be a maximum of 64 characters.' }),
	description: z
		.string()
		.min(1, { message: 'Description must be a minimum of 1 character.' }),
	points: z
		.number()
		.min(0.1, { message: 'Task must be worth a minimum of 0.1 points.' }),
	category: z.enum(['health', 'normal', 'cool', 'productivity', 'insane', '']),
	type: z.enum(['daily', 'multi', 'single', 'weekly', '']),
	lower: z.enum(['higher', 'lower']),
});

function TaskDialog({
	task,
	tasks,
	setTasks,
}: {
	task?: Task;
	tasks: Task[];
	setTasks: (t: Task[]) => void;
}) {
	const [out, setOut] = useState<Task>(genInitialOut());
	const [open, setOpen] = useState<boolean>(false);
	const [name, setName] = useState<string>('');
	const [type, setType] = useState<string>('');
	const [prio, setPrio] = useState<boolean>(false);

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			name: '',
			description: '',
			points: 0,
			category: '',
			type: '',
			lower: 'higher',
		},
	});

	function genInitialOut(): Task {
		return task
			? task
			: ({
					name: '',
					description: '',
					points: 0,
					category: '',
					type: '',
					lower: 'higher',
					scores: {},
				} as unknown as Task);
	}

	async function add() {
		const re = fetch(
			`/api/add_task?data=${encodeURIComponent(JSON.stringify(out))}&code=${encodeURIComponent(localStorage.code)}`,
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
		const ret = await res.json();

		if (ret.hasOwnProperty('message')) {
			toast.error(
				`We ran into an error when adding ${out.name}, ${(ret as { message: string }).message}`,
			);
		} else if (res.status == 200 && ret) {
			setTasks([...tasks, Array.isArray(ret) ? ret[0] : ret]);
		}
		setOut(genInitialOut());
		setOpen(false);
	}

	async function edit() {
		if (task) {
			const re = fetch(
				`/api/update_task?id=${task.id}&data=${encodeURIComponent(JSON.stringify(out))}`,
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
			const ret = await res.json();

			if (res.status == 200 && ret) {
				let out;

				out = tasks.filter((tsk) => task.id !== tsk.id);
				out = [...out, Array.isArray(ret) ? ret[0] : ret];

				setTasks(out);
				setOut(Array.isArray(ret) ? ret[0] : ret);
			} else {
				toast.error(
					`We ran into an error when updating ${task.name}, ${ret.message}`,
				);
			}
			setOpen(false);
		}
	}

	async function del() {
		if (task) {
			const re = fetch(
				`/api/del_task?id=${task.id}&code=${encodeURIComponent(localStorage.code)}`,
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
				let out;
				out = tasks.filter((tsk) => task.id !== tsk.id);
				setTasks(out);
			} else {
				toast.error(
					`We ran into an error when deleting ${task.name}, ${(await res.json()).message}`,
				);
			}
			setOpen(false);
		}
	}

	function onSubmit(values: z.infer<typeof formSchema>) {
		// Do something with the form values.
		// ✅ This will be type-safe and validated.
		console.log(values);
	}

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger>
				{task ? (
					<div className="border-input bg-background hover:bg-accent hover:text-accent-foreground inline-flex h-6 w-6 items-center justify-center rounded-md border text-sm font-medium transition-colors disabled:pointer-events-none disabled:opacity-50">
						<RiEditLine />
					</div>
				) : (
					<div className="text-primary m-0 flex h-min flex-row items-center justify-center gap-2 whitespace-nowrap rounded-md p-0 text-sm font-medium underline-offset-4 transition-colors hover:underline disabled:pointer-events-none disabled:opacity-50">
						<IoCreateOutline /> Create new task
					</div>
				)}
			</DialogTrigger>
			<DialogContent className="h-max w-[40%]">
				<DialogHeader>
					<DialogTitle className="flex flex-row items-center justify-between text-2xl">
						{task ? `Editing "${task.name}"` : 'Create A New Task'}
						{task && (
							<Button
								onClick={del}
								size={'icon'}
								variant={'ghost'}
								className="aspect-square w-auto rounded-xl">
								<Trash2 className="size-5" />
							</Button>
						)}
					</DialogTitle>
					<DialogDescription></DialogDescription>
				</DialogHeader>
				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
						<FormField
							name="name"
							control={form.control}
							render={({ field }) => (
								<FormItem>
									<FormLabel className="mb-1 text-base font-medium">
										Name
									</FormLabel>
									<FormControl>
										<Input
											// defaultValue={out.name}
											placeholder="Task Name"
											className="mb-4"
											// maxLength={64}
											{...field}
										/>
									</FormControl>
									<FormDescription className="-mt-3 mb-2 font-mono text-xs font-normal">
										{`${'0'.repeat(2 - (field.value.length + '').length) + field.value.length}/64 Chars`}
									</FormDescription>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							name="description"
							control={form.control}
							render={({ field }) => (
								<FormItem>
									<FormLabel className="mb-1 text-base font-medium">
										Description
									</FormLabel>
									<FormControl>
										<Textarea
											// defaultValue={out.description}
											placeholder="Task Description"
											className="mb-4 h-auto resize-none"
											{...field}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							name="points"
							control={form.control}
							render={({ field }) => (
								<FormItem>
									<FormLabel className="mb-1 text-base font-medium">
										# of VPs
									</FormLabel>
									<FormControl>
										<Input
											// defaultValue={out.points}
											placeholder="Task VP Worth"
											className="mb-4 w-[30%]"
											type="number"
											{...field}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<div className="grid grid-cols-2">
							<FormField
								name="type"
								control={form.control}
								render={({ field }) => (
									<FormItem>
										<FormLabel className="mb-1 text-base font-medium">
											Type
										</FormLabel>
										<FormControl className="mb-4 flex flex-row items-center justify-start gap-2">
											<ToggleGroup
												type="single"
												// defaultValue={out.type}
												variant={'outline'}
												{...field}
												className="mr-auto">
												<ToggleGroupItem
													value="single"
													disabled={type == 'single'}
													className="disabled:opacity-100">
													Single
												</ToggleGroupItem>
												<ToggleGroupItem
													value="daily"
													disabled={type == 'daily'}
													className="disabled:opacity-100">
													Daily
												</ToggleGroupItem>
												<ToggleGroupItem
													value="multi"
													disabled={type == 'multi'}
													className="disabled:opacity-100">
													Multi
												</ToggleGroupItem>
											</ToggleGroup>
										</FormControl>
									</FormItem>
								)}
							/>
							<FormField
								name="lower"
								control={form.control}
								render={({ field }) => (
									<FormItem>
										<FormLabel className="mb-1 text-base font-medium">
											Priority
											<span className="ml-2 text-xs font-light">
												{'(not required if using single)'}
											</span>
										</FormLabel>
										<FormControl className="mb-4 flex flex-row items-center justify-start gap-2">
											<ToggleGroup
												type="single"
												defaultValue={out.lower ? 'lower' : 'higher'}
												variant={'outline'}
												{...field}>
												<ToggleGroupItem
													value="higher"
													disabled={!prio}
													className="disabled:opacity-100">
													Higher
												</ToggleGroupItem>
												<ToggleGroupItem
													value="lower"
													disabled={prio}
													className="disabled:opacity-100">
													Lower
												</ToggleGroupItem>
											</ToggleGroup>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>
						<FormField
							name="category"
							control={form.control}
							render={({ field }) => (
								<FormItem>
									<FormLabel className="text-base font-medium">
										Category
									</FormLabel>
									<Select
										onValueChange={field.onChange}
										defaultValue={field.value}>
										<FormControl>
											<SelectTrigger className="w-[40%]">
												<SelectValue placeholder="Select a category" />
											</SelectTrigger>
										</FormControl>
										<SelectContent>
											<SelectGroup>
												<SelectLabel>Category</SelectLabel>
												<SelectItem value="health">Health</SelectItem>
												<SelectItem value="normal">Become Normal</SelectItem>
												<SelectItem value="cool">POV: Cool</SelectItem>
												<SelectItem value="productivity">
													Productivity
												</SelectItem>
												<SelectItem value="insane">INSANE</SelectItem>
											</SelectGroup>
										</SelectContent>
									</Select>
									<FormMessage />
								</FormItem>
							)}
						/>
					</form>
				</Form>
				{/* <div className="h-full">
					<Label className="mb-1 text-base font-medium" htmlFor="name">
						Name
					</Label>
					<Input
						id="name"
						defaultValue={out.name}
						placeholder="Task Name"
						className="mb-4"
						onChange={(evt) => {
							const t = out;
							t.name = evt.target.value;
							setOut(t);
							setName(evt.target.value);
						}}
						maxLength={64}
					/>
					<div className="-mt-3 mb-2 font-mono text-xs font-normal">
						{`${'0'.repeat(2 - (name.length + '').length) + name.length}/64 Chars`}
					</div>

					<Label className="mb-1 text-base font-medium" htmlFor="desc">
						Description
					</Label>
					<Textarea
						id="desc"
						defaultValue={out.description}
						placeholder="Task Description"
						className="mb-4 h-auto resize-none"
						onChange={(evt) => {
							const t = out;
							t.description = evt.target.value;
							setOut(t);
						}}
					/>

					<Label className="mb-1 text-base font-medium" htmlFor="vp">
						# of VPs
					</Label>
					<Input
						id="vp"
						defaultValue={out.points}
						placeholder="Task VP Worth"
						className="mb-4 w-[30%]"
						type="number"
						onChange={(evt) => {
							const t = out;
							t.points = +evt.target.value;
							setOut(t);
						}}
					/>
					<div className="grid grid-cols-2">
						<div>
							<Label className="mb-1 text-base font-medium" htmlFor="type">
								Type
							</Label>
							<div className="mb-4 flex flex-row items-center gap-2" id="type">
								<ToggleGroup
									type="single"
									defaultValue={out.type}
									variant={'outline'}
									onValueChange={(typ) => {
										const t = out;
										t.type = typ as Task['type'];
										setOut(t);
										setType(typ);
									}}>
									<ToggleGroupItem
										value="single"
										disabled={type == 'single'}
										className="disabled:opacity-100">
										Single
									</ToggleGroupItem>
									<ToggleGroupItem
										value="daily"
										disabled={type == 'daily'}
										className="disabled:opacity-100">
										Daily
									</ToggleGroupItem>
									<ToggleGroupItem
										value="multi"
										disabled={type == 'multi'}
										className="disabled:opacity-100">
										Multi
									</ToggleGroupItem>
								</ToggleGroup>
							</div>
						</div>
						<div>
							<Label className="mb-1 text-base font-medium" htmlFor="type">
								Priority
								<span className="ml-2 text-xs font-light">
									{'(not required if using single)'}
								</span>
							</Label>
							<div className="mb-4 flex flex-row items-center gap-2" id="type">
								<ToggleGroup
									type="single"
									defaultValue={out.lower ? 'lower' : 'higher'} // FIXME: REQUIRE THERE TO BE ONE IN THE TOGGLE GROUP OTHERWISE IT WILL BE SCUFFED
									variant={'outline'}
									onValueChange={(lower) => {
										const t = out;
										t.lower = lower == 'lower';
										setOut(t);
										setPrio(lower == 'lower');
									}}>
									<ToggleGroupItem
										value="higher"
										disabled={!prio}
										className="disabled:opacity-100">
										Higher
									</ToggleGroupItem>
									<ToggleGroupItem
										value="lower"
										disabled={prio}
										className="disabled:opacity-100">
										Lower
									</ToggleGroupItem>
								</ToggleGroup>
							</div>
						</div>
					</div>

					<Label className="text-base font-medium" id="category">
						Category
					</Label>
					<Select
						defaultValue={out.category}
						onValueChange={(category) => {
							const t = out;
							t.category = category as Task['category'];
							setOut(t);
						}}>
						<SelectTrigger className="w-[40%]">
							<SelectValue placeholder="Select a category" />
						</SelectTrigger>
						<SelectContent>
							<SelectGroup>
								<SelectLabel>Category</SelectLabel>
								<SelectItem value="health">Health</SelectItem>
								<SelectItem value="normal">Become Normal</SelectItem>
								<SelectItem value="cool">POV: Cool</SelectItem>
								<SelectItem value="productivity">Productivity</SelectItem>
								<SelectItem value="insane">INSANE</SelectItem>
							</SelectGroup>
						</SelectContent>
					</Select>
				</div> */}
				<DialogFooter>
					<DialogClose>
						<Button variant={'outline'}>Cancel</Button>
					</DialogClose>
					{/* {task ? (
						<Button
							onClick={() => {
								edit();
							}}>
							Submit
						</Button>
					) : (
						<Button
							onClick={() => {
								add();
							}}>
							Create
						</Button>
					)} */}
					<Button type="submit">{task ? 'Submit' : 'Create'}</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
