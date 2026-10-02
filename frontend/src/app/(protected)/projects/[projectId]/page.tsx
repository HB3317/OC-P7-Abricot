import SingleProjectView from "@/views/projects/SingleProjectView";

type SingleProjectPageProps = {
    params: Promise<{
        projectId: string;
    }>;
};

export default async function SingleProjectPage({
    params,
}: SingleProjectPageProps) {
    const { projectId } = await params;

    return (
        <SingleProjectView
            projectId={projectId}
        />
    );
}
