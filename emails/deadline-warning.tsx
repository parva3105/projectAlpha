import { Html, Head, Body, Container, Heading, Text, Preview } from '@react-email/components'

interface Props {
  dealTitle: string
  deadline: string
}

export default function DeadlineWarningEmail({ dealTitle, deadline }: Props) {
  return (
    <Html>
      <Head />
      <Preview>Deal deadline in 48 hours: &quot;{dealTitle}&quot;</Preview>
      <Body style={{ fontFamily: 'sans-serif', backgroundColor: '#f9fafb' }}>
        <Container style={{ padding: '40px 20px', maxWidth: '560px', margin: '0 auto' }}>
          <Heading style={{ fontSize: '24px', color: '#111827' }}>Deal deadline in 48 hours</Heading>
          <Text style={{ color: '#6b7280' }}>
            The deal <strong>&quot;{dealTitle}&quot;</strong> is due on{' '}
            <strong>{deadline}</strong> — that is less than 48 hours away.
          </Text>
          <Text style={{ color: '#6b7280' }}>
            Log in to your agency portal to review the deal status and take any necessary action
            before the deadline.
          </Text>
        </Container>
      </Body>
    </Html>
  )
}
